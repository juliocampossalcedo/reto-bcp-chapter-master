import { useEffect, useState } from 'react';
import {
  authErrorMessage,
  type AuthGateway,
  type AuthIdentity,
} from '../../application/ports/AuthGateway';

type Session =
  | { status: 'initializing' }
  | { status: 'signedOut' }
  | { status: 'signedIn'; identity: AuthIdentity }
  | { status: 'error'; message: string };

export function useAuthSession(gateway: AuthGateway) {
  const [session, setSession] = useState<Session>({ status: 'initializing' });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    const unsubscribe = gateway.observeSession(
      identity => {
        if (active) {
          setSession(
            identity
              ? { status: 'signedIn', identity }
              : { status: 'signedOut' },
          );
        }
      },
      error => {
        if (active)
          setSession({ status: 'error', message: authErrorMessage(error) });
      },
    );
    return () => {
      active = false;
      unsubscribe();
    };
  }, [gateway, attempt]);
  return {
    session,
    retry() {
      setSession({ status: 'initializing' });
      setAttempt(value => value + 1);
    },
  };
}
