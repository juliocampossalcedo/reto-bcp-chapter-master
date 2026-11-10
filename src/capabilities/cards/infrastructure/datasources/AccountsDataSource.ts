import type { Account } from '../../domain/models/Account';

export type AccountRecord = Readonly<Account>;

export interface AccountsDataSource {
  readAccounts(): Promise<readonly AccountRecord[]>;
}
