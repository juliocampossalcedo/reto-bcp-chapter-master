import React from 'react';
import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import App from '../App';
import { LocalCardsDataSource } from '../src/capabilities/cards/infrastructure/datasources/LocalCardsDataSource';
import { useProductsStore } from '../src/capabilities/cards/presentation/store/useProductsStore';
import type { AuthIdentity } from '../src/capabilities/auth/application/ports/AuthGateway';

jest.mock('../src/app/composition/authDependencies', () => ({
  authGateway: {
    observeSession: (listener: (identity: AuthIdentity | null) => void) => {
      listener({ uid: 'test-session' });
      return jest.fn();
    },
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);

beforeEach(() => {
  useProductsStore.setState(useProductsStore.getInitialState());
});

test('abre el Dashboard en Mis productos y conserva los datos al cambiar de tab', async () => {
  const readCards = jest.spyOn(LocalCardsDataSource.prototype, 'readCards');
  await render(<App />);

  expect(screen.getByText('iO Productos & Beneficios')).toBeTruthy();
  expect(await screen.findByText('Cuenta principal')).toBeTruthy();
  expect(screen.getByText('**** **** **** 1234')).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Mis productos' }).props
      .accessibilityState,
  ).toEqual({ selected: true });
  expect(
    screen.getAllByRole('button', { name: /Mis productos|Beneficios/ }),
  ).toHaveLength(2);

  await fireEvent.press(screen.getByRole('button', { name: 'Beneficios' }));
  expect(
    await screen.findByText('3 beneficios disponibles para tus tarjetas'),
  ).toBeTruthy();

  await fireEvent.press(screen.getByRole('button', { name: 'Mis productos' }));
  await waitFor(() => {
    expect(screen.getByText('Cuenta principal')).toBeTruthy();
  });
  expect(useProductsStore.getState().status).toBe('success');
  // Products and Benefits each read the local cards once; returning to Products does not reload them.
  expect(readCards).toHaveBeenCalledTimes(2);
  readCards.mockRestore();
});
