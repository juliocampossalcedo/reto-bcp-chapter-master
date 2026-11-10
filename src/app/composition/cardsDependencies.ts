import { loadProducts } from '../../capabilities/cards/application/usecases/loadProducts';
import { LocalAccountsDataSource } from '../../capabilities/cards/infrastructure/datasources/LocalAccountsDataSource';
import { LocalCardsDataSource } from '../../capabilities/cards/infrastructure/datasources/LocalCardsDataSource';
import { MockAccountRepository } from '../../capabilities/cards/infrastructure/repositories/MockAccountRepository';
import { MockCardRepository } from '../../capabilities/cards/infrastructure/repositories/MockCardRepository';

const accountRepository = new MockAccountRepository(
  new LocalAccountsDataSource(),
);
export const cardRepository = new MockCardRepository(
  new LocalCardsDataSource(),
);

export const loadLocalProducts = () =>
  loadProducts(accountRepository, cardRepository);
