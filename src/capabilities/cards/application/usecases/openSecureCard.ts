import type { SecureTokenProvider } from '../ports/SecureTokenProvider';
import type { SecureViewGateway } from '../ports/SecureViewGateway';

export async function openSecureCard(
  cardId: string,
  tokenProvider: SecureTokenProvider,
  gateway: SecureViewGateway,
): Promise<void> {
  const token = await tokenProvider.getOrRenewToken(cardId);
  await gateway.openSecureView({ cardId, secureToken: token.value });
}
