import { openSecureCard } from '../usecases/openSecureCard';
import type { SecureTokenProvider } from '../ports/SecureTokenProvider';
import type { SecureViewGateway } from '../ports/SecureViewGateway';

test('solicita un token nuevo y envía solo cardId y token al gateway', async () => {
  const getOrRenewToken = jest
    .fn()
    .mockResolvedValueOnce({ value: 'opaque-1', expiresAtEpochMs: 1000 })
    .mockResolvedValueOnce({ value: 'opaque-2', expiresAtEpochMs: 2000 });
  const openSecureView = jest.fn().mockResolvedValue(undefined);
  const provider = { getOrRenewToken } as SecureTokenProvider;
  const gateway = { openSecureView, subscribe: jest.fn() } as SecureViewGateway;
  await openSecureCard('card_001', provider, gateway);
  await openSecureCard('card_001', provider, gateway);
  expect(getOrRenewToken).toHaveBeenCalledTimes(2);
  expect(openSecureView).toHaveBeenNthCalledWith(1, {
    cardId: 'card_001',
    secureToken: 'opaque-1',
  });
  expect(openSecureView).toHaveBeenNthCalledWith(2, {
    cardId: 'card_001',
    secureToken: 'opaque-2',
  });
});
