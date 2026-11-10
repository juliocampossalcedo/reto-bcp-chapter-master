import type { CardRecord, CardsDataSource } from './CardsDataSource';
import cards from '../mocks/cards.json';

const MASKED_PAN = /^\*{4} \*{4} \*{4} \d{4}$/;
const EXPIRY = /^(0[1-9]|1[0-2])\/\d{2}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export class LocalCardsDataSource implements CardsDataSource {
  constructor(private readonly records: unknown = cards) {}

  async readCards(): Promise<readonly CardRecord[]> {
    if (!Array.isArray(this.records)) {
      throw new Error('Datos de tarjetas inválidos');
    }

    const seen = new Set<string>();
    return this.records.map((record: unknown): CardRecord => {
      if (
        !isRecord(record) ||
        !nonEmptyText(record.cardId) ||
        !nonEmptyText(record.accountId) ||
        !nonEmptyText(record.alias) ||
        !nonEmptyText(record.brand) ||
        typeof record.maskedPan !== 'string' ||
        !MASKED_PAN.test(record.maskedPan) ||
        typeof record.expiry !== 'string' ||
        !EXPIRY.test(record.expiry)
      ) {
        throw new Error('Datos de tarjetas inválidos');
      }

      const cardId = record.cardId.trim();
      if (seen.has(cardId)) {
        throw new Error('Identificadores de tarjeta duplicados');
      }
      seen.add(cardId);

      return {
        cardId,
        accountId: record.accountId.trim(),
        alias: record.alias.trim(),
        brand: record.brand.trim().toUpperCase(),
        maskedPan: record.maskedPan,
        expiry: record.expiry,
      };
    });
  }
}
