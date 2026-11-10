import type { AccountRecord, AccountsDataSource } from './AccountsDataSource';
import accounts from '../mocks/accounts.json';

const MASKED_ACCOUNT_NUMBER = /^\*{4} \d{4}$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function nonEmptyText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

export class LocalAccountsDataSource implements AccountsDataSource {
  constructor(private readonly records: unknown = accounts) {}

  async readAccounts(): Promise<readonly AccountRecord[]> {
    if (!Array.isArray(this.records)) {
      throw new Error('Datos de cuentas inválidos');
    }

    const seen = new Set<string>();
    return this.records.map((record: unknown): AccountRecord => {
      if (
        !isRecord(record) ||
        !nonEmptyText(record.accountId) ||
        !nonEmptyText(record.alias) ||
        (record.maskedNumber !== undefined &&
          (typeof record.maskedNumber !== 'string' ||
            !MASKED_ACCOUNT_NUMBER.test(record.maskedNumber)))
      ) {
        throw new Error('Datos de cuentas inválidos');
      }

      const accountId = record.accountId.trim();
      if (seen.has(accountId)) {
        throw new Error('Identificadores de cuenta duplicados');
      }
      seen.add(accountId);

      return {
        accountId,
        alias: record.alias.trim(),
        ...(record.maskedNumber === undefined
          ? {}
          : { maskedNumber: record.maskedNumber }),
      };
    });
  }
}
