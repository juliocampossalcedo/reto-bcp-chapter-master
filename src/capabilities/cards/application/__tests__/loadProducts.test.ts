import { loadProducts } from '../usecases/loadProducts';

const account = { accountId: 'acc_001', alias: 'Cuenta de prueba' };
const card = {
  cardId: 'card_001',
  accountId: 'acc_001',
  alias: 'Tarjeta de prueba',
  brand: 'VISA',
  maskedPan: '**** **** **** 1234',
  expiry: '12/28',
};

test('carga cuentas y tarjetas a través de sus repositorios', async () => {
  const accounts = { listAccounts: jest.fn().mockResolvedValue([account]) };
  const cards = { listCards: jest.fn().mockResolvedValue([card]) };

  await expect(loadProducts(accounts, cards)).resolves.toEqual({
    accounts: [account],
    cards: [card],
  });
  expect(accounts.listAccounts).toHaveBeenCalledTimes(1);
  expect(cards.listCards).toHaveBeenCalledTimes(1);
});

test('rechaza referencias de tarjeta a una cuenta inexistente', async () => {
  const accounts = { listAccounts: jest.fn().mockResolvedValue([]) };
  const cards = { listCards: jest.fn().mockResolvedValue([card]) };

  await expect(loadProducts(accounts, cards)).rejects.toThrow(
    'Referencias de productos inválidas',
  );
});
