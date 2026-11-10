import { getApps, initializeApp } from 'firebase/app';
import { initializeAuth, inMemoryPersistence } from 'firebase/auth';
import { AuthFailure } from '../../application/ports/AuthGateway';
import { firebaseConfig } from './firebaseConfig';

const APP_NAME = 'io-products-benefits-auth';

export function getFirebaseAuth() {
  if (Object.values(firebaseConfig).some(value => !value.trim())) {
    throw new AuthFailure('not-configured');
  }
  const app =
    getApps().find(candidate => candidate.name === APP_NAME) ??
    initializeApp(firebaseConfig, APP_NAME);
  // The SDK reuses Auth when called with the same dependencies (also on refresh).
  return initializeAuth(app, { persistence: inMemoryPersistence });
}
