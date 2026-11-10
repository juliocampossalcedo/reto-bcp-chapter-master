import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import {
  AuthFailure,
  type AuthGateway,
  type AuthIdentity,
} from '../../application/ports/AuthGateway';
import { getFirebaseAuth } from './firebaseClient';

function publicFailure(error: unknown): AuthFailure {
  if (error instanceof AuthFailure) return error;
  const code =
    typeof error === 'object' && error !== null && 'code' in error
      ? error.code
      : undefined;
  if (
    [
      'auth/invalid-credential',
      'auth/invalid-login-credentials',
      'auth/wrong-password',
      'auth/user-not-found',
      'auth/user-disabled',
      'auth/invalid-email',
    ].includes(String(code))
  ) {
    return new AuthFailure('invalid-credentials');
  }
  return new AuthFailure('unavailable');
}

export class FirebaseAuthGateway implements AuthGateway {
  observeSession(
    listener: (identity: AuthIdentity | null) => void,
    onError: (error: unknown) => void,
  ): () => void {
    try {
      return onAuthStateChanged(
        getFirebaseAuth(),
        user => listener(user ? { uid: user.uid } : null),
        error => onError(publicFailure(error)),
      );
    } catch (error) {
      onError(publicFailure(error));
      return () => {};
    }
  }

  async signIn(email: string, password: string): Promise<void> {
    try {
      await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    } catch (error) {
      throw publicFailure(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await signOut(getFirebaseAuth());
    } catch (error) {
      throw publicFailure(error);
    }
  }
}
