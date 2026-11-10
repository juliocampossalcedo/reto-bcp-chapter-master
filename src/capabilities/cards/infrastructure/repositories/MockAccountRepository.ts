import type { Account } from '../../domain/models/Account';
import type { AccountRepository } from '../../domain/repositories/AccountRepository';
import type { AccountsDataSource } from '../datasources/AccountsDataSource';

export class MockAccountRepository implements AccountRepository {
  constructor(private readonly dataSource: AccountsDataSource) {}

  listAccounts(): Promise<readonly Account[]> {
    return this.dataSource.readAccounts();
  }
}
