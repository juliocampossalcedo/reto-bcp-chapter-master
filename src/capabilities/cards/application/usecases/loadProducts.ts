import type { Account } from '../../domain/models/Account';
import type { Card } from '../../domain/models/Card';
import type { AccountRepository } from '../../domain/repositories/AccountRepository';
import type { CardRepository } from '../../domain/repositories/CardRepository';

export interface ProductsSnapshot {
  readonly accounts: readonly Account[];
  readonly cards: readonly Card[];
}

export async function loadProducts(
  accountRepository: AccountRepository,
  cardRepository: CardRepository,
): Promise<ProductsSnapshot> {
  const [accounts, cards] = await Promise.all([
    accountRepository.listAccounts(),
    cardRepository.listCards(),
  ]);

  const accountIds = new Set(accounts.map(account => account.accountId));
  if (cards.some(card => !accountIds.has(card.accountId))) {
    throw new Error('Referencias de productos inválidas');
  }

  return { accounts, cards };
}
