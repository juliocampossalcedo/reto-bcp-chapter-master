import { FirebaseAuthGateway } from '../../capabilities/auth/infrastructure/firebase/FirebaseAuthGateway';

// No connection is made until the root subscribes to the session.
export const authGateway = new FirebaseAuthGateway();
