export type AuthIdentity = Readonly<{ uid: string }>;

export interface AuthGateway {
  observeSession(
    listener: (identity: AuthIdentity | null) => void,
    onError: (error: unknown) => void,
  ): () => void;
  signIn(email: string, password: string): Promise<void>;
  signOut(): Promise<void>;
}

export class AuthFailure extends Error {
  constructor(
    readonly code: 'invalid-credentials' | 'unavailable' | 'not-configured',
  ) {
    super('No se pudo completar la autenticación');
  }
}

export function authErrorMessage(error: unknown): string {
  if (error instanceof AuthFailure) {
    if (error.code === 'not-configured') {
      return 'Firebase no configurado. Completa la configuración cliente para iniciar sesión.';
    }
    if (error.code === 'invalid-credentials') {
      return 'No pudimos iniciar sesión con esos datos. Revisa el correo y la contraseña.';
    }
  }
  return 'No pudimos conectar con el servicio. Revisa tu conexión e inténtalo nuevamente.';
}
