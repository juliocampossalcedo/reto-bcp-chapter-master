import type { Account } from '../models/Account';

export interface AccountRepository {
  listAccounts(): Promise<readonly Account[]>;
}
