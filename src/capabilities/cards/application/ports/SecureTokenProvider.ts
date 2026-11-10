export interface SecureToken {
  readonly value: string;
  readonly expiresAtEpochMs: number;
}

export interface SecureTokenProvider {
  getOrRenewToken(cardId: string): Promise<SecureToken>;
}
