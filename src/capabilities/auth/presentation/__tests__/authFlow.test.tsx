import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import AppRoot from '../../../../app/AppRoot';
import {
  AuthFailure,
  type AuthGateway,
  type AuthIdentity,
} from '../../application/ports/AuthGateway';
import { useProductsStore } from '../../../cards/presentation/store/useProductsStore';

jest.mock('../../../../app/composition/authDependencies', () => ({
  authGateway: null,
}));
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

function gateway() {
  let notify: (identity: AuthIdentity | null) => void = () => {};
  let fail: (error: unknown) => void = () => {};
  const unsubscribe = jest.fn();
  const auth = {
    observeSession: jest.fn<
      ReturnType<AuthGateway['observeSession']>,
      Parameters<AuthGateway['observeSession']>
    >((listener, onError) => {
      notify = listener;
      fail = onError;
      return unsubscribe;
    }),
    signIn: jest
      .fn<
        ReturnType<AuthGateway['signIn']>,
        Parameters<AuthGateway['signIn']>
      >()
      .mockResolvedValue(undefined),
    signOut: jest
      .fn<
        ReturnType<AuthGateway['signOut']>,
        Parameters<AuthGateway['signOut']>
      >()
      .mockResolvedValue(undefined),
  };
  return {
    auth,
    unsubscribe,
    notify: (identity: AuthIdentity | null) => act(() => notify(identity)),
    fail: (error: unknown) => act(() => fail(error)),
  };
}

async function credentials() {
  await fireEvent.changeText(
    screen.getByLabelText('Correo electrónico'),
    'demo@example.invalid',
  );
  await fireEvent.changeText(
    screen.getByLabelText('Contraseña'),
    'test-only-input',
  );
}

beforeEach(() => {
  useProductsStore.setState(useProductsStore.getInitialState());
});

test('espera confirmación inicial sin flash de Dashboard y retira el listener', async () => {
  const session = gateway();
  const view = await render(<AppRoot authGateway={session.auth} />);
  expect(
    screen.getByRole('progressbar', { name: 'Verificando sesión' }),
  ).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Mis productos' })).toBeNull();
  expect(screen.queryByRole('button', { name: 'Ingresar' })).toBeNull();
  await session.notify(null);
  expect(screen.getByRole('button', { name: 'Ingresar' })).toBeTruthy();
  expect(screen.getByLabelText('Correo electrónico').props.value).toBe(
    'julio@retobcp.com',
  );
  expect(screen.getByLabelText('Contraseña').props.value).toBe('');
  expect(screen.getByLabelText('Contraseña').props.secureTextEntry).toBe(true);
  await view.unmount();
  expect(session.unsubscribe).toHaveBeenCalledTimes(1);
});

test('solo el observador abre Dashboard; logout desmonta las dos tabs y vuelve a Login', async () => {
  const session = gateway();
  await render(<AppRoot authGateway={session.auth} />);
  await session.notify(null);
  await credentials();
  await fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
  expect(session.auth.signIn).toHaveBeenCalledWith(
    'demo@example.invalid',
    'test-only-input',
  );
  expect(screen.getByLabelText('Contraseña').props.value).toBe('');
  expect(screen.queryByRole('button', { name: 'Mis productos' })).toBeNull();
  await session.notify({ uid: 'test-user' });
  expect(await screen.findByText('Cuenta principal')).toBeTruthy();
  expect(screen.getByRole('button', { name: 'Beneficios' })).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(session.auth.signOut).toHaveBeenCalledTimes(1);
  await session.notify(null);
  expect(screen.getByRole('button', { name: 'Ingresar' })).toBeTruthy();
  expect(screen.queryByRole('button', { name: 'Beneficios' })).toBeNull();
  expect(screen.queryByText('Cuenta principal')).toBeNull();
  expect(session.auth.observeSession).toHaveBeenCalledTimes(1);
});

test('valida el formulario, evita duplicados y permite corregir credenciales inválidas', async () => {
  const session = gateway();
  let reject!: (error: unknown) => void;
  session.auth.signIn.mockImplementationOnce(
    () =>
      new Promise((_resolve, no) => {
        reject = no;
      }),
  );
  await render(<AppRoot authGateway={session.auth} />);
  await session.notify(null);
  await fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
  expect(screen.getByRole('alert')).toHaveTextContent(
    'Ingresa un correo electrónico válido y tu contraseña.',
  );
  expect(session.auth.signIn).not.toHaveBeenCalled();
  await credentials();
  await fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
  expect(screen.getByRole('button', { name: 'Ingresar' })).toBeDisabled();
  await fireEvent(screen.getByLabelText('Contraseña'), 'submitEditing');
  expect(session.auth.signIn).toHaveBeenCalledTimes(1);
  await act(() => reject(new AuthFailure('invalid-credentials')));
  expect(screen.getByRole('alert')).toHaveTextContent(
    /No pudimos iniciar sesión con esos datos/,
  );
  expect(screen.queryByRole('button', { name: 'Mis productos' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
  expect(session.auth.signIn).toHaveBeenCalledTimes(2);
  expect(screen.queryByRole('alert')).toBeNull();
});

test('config ausente o fallo del servicio cierran acceso; retry retira el observador anterior', async () => {
  const session = gateway();
  await render(<AppRoot authGateway={session.auth} />);
  const staleListener = session.auth.observeSession.mock.calls[0][0];
  await session.fail(new AuthFailure('not-configured'));
  expect(screen.getByRole('alert')).toHaveTextContent(
    /Firebase no configurado/,
  );
  expect(screen.queryByRole('button', { name: 'Ingresar' })).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
  expect(session.unsubscribe).toHaveBeenCalledTimes(1);
  await act(() => staleListener({ uid: 'stale-user' }));
  expect(screen.queryByRole('button', { name: 'Mis productos' })).toBeNull();
  await session.notify(null);
  session.auth.signIn.mockRejectedValueOnce(new Error('internal-discard'));
  await credentials();
  await fireEvent.press(screen.getByRole('button', { name: 'Ingresar' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/Revisa tu conexión/);
  expect(screen.queryByText('internal-discard')).toBeNull();
});

test('fallo de logout es público y permite reintento sin inventar una sesión cerrada', async () => {
  const session = gateway();
  session.auth.signOut.mockRejectedValueOnce(new AuthFailure('unavailable'));
  await render(<AppRoot authGateway={session.auth} />);
  await session.notify({ uid: 'test-user' });
  await screen.findByText('Cuenta principal');
  await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(screen.getByRole('alert')).toHaveTextContent(/Revisa tu conexión/);
  expect(screen.getByRole('button', { name: 'Mis productos' })).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Cerrar sesión' }));
  expect(session.auth.signOut).toHaveBeenCalledTimes(2);
  await session.notify(null);
  expect(screen.getByRole('button', { name: 'Ingresar' })).toBeTruthy();
});
