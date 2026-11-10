import type { IoSecureViewSpec } from 'io-native-components';
import type {
  SecureViewEvent,
  SecureViewGateway,
  OpenSecureViewRequest,
} from '../../application/ports/SecureViewGateway';

export class NativeSecureViewGateway implements SecureViewGateway {
  constructor(private readonly module: IoSecureViewSpec) {}

  async openSecureView({
    cardId,
    secureToken,
  }: OpenSecureViewRequest): Promise<void> {
    const accepted = await this.module.openSecureView(cardId, secureToken);
    if (!accepted) throw new Error('Vista segura no disponible');
  }

  subscribe(listener: (event: SecureViewEvent) => void): () => void {
    const subscriptions = [
      this.module.onSecureViewOpened(payload => {
        if (typeof payload?.cardId === 'string')
          listener({
            name: 'onSecureViewOpened',
            payload: { cardId: payload.cardId },
          });
      }),
      this.module.onValidationError(payload => {
        if (
          (payload?.code === 'TOKEN_INVALID' ||
            payload?.code === 'TOKEN_EXPIRED') &&
          typeof payload.message === 'string'
        ) {
          listener({
            name: 'onValidationError',
            payload: {
              code: payload.code,
              message:
                payload.code === 'TOKEN_EXPIRED'
                  ? 'La autorización venció. Vuelve a solicitarla.'
                  : 'No se pudo validar el acceso. Vuelve a intentarlo.',
            },
          });
        }
      }),
      this.module.onCardDataShown(payload => {
        if (typeof payload?.cardId === 'string')
          listener({
            name: 'onCardDataShown',
            payload: { cardId: payload.cardId },
          });
      }),
      this.module.onSecureViewClosed(payload => {
        if (
          typeof payload?.cardId === 'string' &&
          (payload.reason === 'TIMEOUT' || payload.reason === 'USER_DISMISS')
        ) {
          listener({
            name: 'onSecureViewClosed',
            payload: { cardId: payload.cardId, reason: payload.reason },
          });
        }
      }),
    ];
    return () => subscriptions.forEach(subscription => subscription.remove());
  }
}
