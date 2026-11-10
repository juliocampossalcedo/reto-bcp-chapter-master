import type { SecureTokenProvider } from '../../application/ports/SecureTokenProvider';
import type { IoSecureViewSpec } from 'io-native-components';

export class NativeSecureTokenProvider implements SecureTokenProvider {
  constructor(private readonly module: IoSecureViewSpec) {}

  async getOrRenewToken(cardId: string) {
    if (!cardId.trim()) throw new Error('Tarjeta no disponible');
    const token = await this.module.issueSecureToken(cardId);
    if (
      !token ||
      typeof token.value !== 'string' ||
      !token.value ||
      !Number.isFinite(token.expiresAtEpochMs)
    ) {
      throw new Error('No se pudo emitir la autorización');
    }
    return { value: token.value, expiresAtEpochMs: token.expiresAtEpochMs };
  }
}
