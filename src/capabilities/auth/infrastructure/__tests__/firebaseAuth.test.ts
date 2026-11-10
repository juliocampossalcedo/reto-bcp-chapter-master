import { getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  initializeAuth,
  inMemoryPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type Auth,
  type User,
  type UserCredential,
} from 'firebase/auth';
import { FirebaseAuthGateway } from '../firebase/FirebaseAuthGateway';
import { getFirebaseAuth } from '../firebase/firebaseClient';
import { firebaseConfig } from '../firebase/firebaseConfig';

jest.mock('firebase/app', () => ({
  getApps: jest.fn(),
  initializeApp: jest.fn(),
}));
jest.mock('firebase/auth', () => ({
  initializeAuth: jest.fn(),
  inMemoryPersistence: { type: 'NONE' },
  onAuthStateChanged: jest.fn(),
  signInWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}));
jest.mock('../firebase/firebaseConfig', () => ({
  firebaseConfig: {
    apiKey: 'test-config-placeholder',
    authDomain: 'demo.example.invalid',
    projectId: 'test-project',
    appId: 'test-app',
  },
}));

beforeEach(() => {
  jest.resetAllMocks();
  firebaseConfig.apiKey = 'test-config-placeholder';
  jest.mocked(getApps).mockReturnValue([]);
  jest
    .mocked(initializeApp)
    .mockReturnValue({ name: 'io-products-benefits-auth' } as FirebaseApp);
  jest.mocked(initializeAuth).mockReturnValue({} as Auth);
  jest
    .mocked(signInWithEmailAndPassword)
    .mockResolvedValue({} as UserCredential);
  jest.mocked(signOut).mockResolvedValue(undefined);
});

test('reutiliza app, usa memoria, proyecta solo uid y delega login/logout con cleanup', async () => {
  getFirebaseAuth();
  const app = jest.mocked(initializeApp).mock.results[0].value as FirebaseApp;
  jest.mocked(getApps).mockReturnValue([app]);
  getFirebaseAuth();
  expect(initializeApp).toHaveBeenCalledTimes(1);
  expect(initializeAuth).toHaveBeenLastCalledWith(app, {
    persistence: inMemoryPersistence,
  });
  const unsubscribe = jest.fn();
  jest.mocked(onAuthStateChanged).mockReturnValue(unsubscribe);
  const gateway = new FirebaseAuthGateway();
  const listener = jest.fn();
  const onError = jest.fn();
  const stop = gateway.observeSession(listener, onError);
  const notify = jest.mocked(onAuthStateChanged).mock.calls[0][1];
  if (typeof notify !== 'function') throw new Error('Expected SDK callback');
  notify({ uid: 'test-uid', displayName: 'discard-extra' } as User);
  expect(listener).toHaveBeenLastCalledWith({ uid: 'test-uid' });
  notify(null);
  expect(listener).toHaveBeenLastCalledWith(null);
  await expect(
    gateway.signIn('demo@example.invalid', 'test-only-input'),
  ).resolves.toBeUndefined();
  expect(signInWithEmailAndPassword).toHaveBeenCalledWith(
    expect.anything(),
    'demo@example.invalid',
    'test-only-input',
  );
  await gateway.signOut();
  expect(signOut).toHaveBeenCalledTimes(1);
  stop();
  expect(unsubscribe).toHaveBeenCalledTimes(1);
  expect(onError).not.toHaveBeenCalled();
});

test('rechaza config vacía y normaliza errores SDK sin propagar mensajes ni credenciales', async () => {
  const gateway = new FirebaseAuthGateway();
  firebaseConfig.apiKey = '';
  const onError = jest.fn();
  gateway.observeSession(jest.fn(), onError)();
  expect(onError).toHaveBeenCalledWith(
    expect.objectContaining({ code: 'not-configured' }),
  );
  expect(initializeApp).not.toHaveBeenCalled();
  await expect(
    gateway.signIn('demo@example.invalid', 'test-only-input'),
  ).rejects.toMatchObject({ code: 'not-configured' });
  firebaseConfig.apiKey = 'test-config-placeholder';
  jest.mocked(signInWithEmailAndPassword).mockRejectedValueOnce({
    code: 'auth/invalid-credential',
    message: 'discard-internal',
  });
  await expect(
    gateway.signIn('demo@example.invalid', 'test-only-input'),
  ).rejects.toMatchObject({
    code: 'invalid-credentials',
    message: 'No se pudo completar la autenticación',
  });
  jest.mocked(signOut).mockRejectedValueOnce({
    code: 'auth/network-request-failed',
    message: 'discard-internal',
  });
  await expect(gateway.signOut()).rejects.toMatchObject({
    code: 'unavailable',
    message: 'No se pudo completar la autenticación',
  });
  jest.mocked(onAuthStateChanged).mockReturnValue(jest.fn());
  gateway.observeSession(jest.fn(), onError);
  const fail = jest.mocked(onAuthStateChanged).mock.calls[0][2];
  fail?.(new Error('discard-internal'));
  expect(onError).toHaveBeenLastCalledWith(
    expect.objectContaining({ code: 'unavailable' }),
  );
});
