import { LocalAccountsDataSource } from '../datasources/LocalAccountsDataSource';
import { LocalCardsDataSource } from '../datasources/LocalCardsDataSource';
import { MockAccountRepository } from '../repositories/MockAccountRepository';
import { MockCardRepository } from '../repositories/MockCardRepository';

const account = {
  accountId: 'acc_001',
  alias: 'Cuenta de prueba',
  maskedNumber: '**** 4321',
};
const card = {
  cardId: 'card_001',
  accountId: 'acc_001',
  alias: 'Tarjeta de prueba',
  brand: ' visa ',
  maskedPan: '**** **** **** 1234',
  expiry: '12/28',
};

describe('datos locales de productos', () => {
  test('proyecta solo los campos permitidos y normaliza la marca', async () => {
    const accounts = await new LocalAccountsDataSource([
      { ...account, unexpected: 'descartar' },
    ]).readAccounts();
    const cards = await new LocalCardsDataSource([
      { ...card, unexpected: 'descartar' },
    ]).readCards();

    expect(accounts).toEqual([account]);
    expect(cards).toEqual([{ ...card, brand: 'VISA' }]);
    expect(Object.keys(cards[0]).sort()).toEqual(
      ['cardId', 'accountId', 'alias', 'brand', 'maskedPan', 'expiry'].sort(),
    );
  });

  test('los mocks reales tienen IDs únicos, referencias válidas y datos enmascarados', async () => {
    const accounts = await new LocalAccountsDataSource().readAccounts();
    const cards = await new LocalCardsDataSource().readCards();
    const accountIds = new Set(accounts.map(item => item.accountId));

    expect(accounts).toHaveLength(2);
    expect(cards).toHaveLength(3);
    expect(accountIds.size).toBe(accounts.length);
    expect(new Set(cards.map(item => item.cardId)).size).toBe(cards.length);
    for (const item of cards) {
      expect(accountIds.has(item.accountId)).toBe(true);
      expect(item.maskedPan).toMatch(/^\*{4} \*{4} \*{4} \d{4}$/);
      expect(item.expiry).toMatch(/^(0[1-9]|1[0-2])\/\d{2}$/);
      expect(item.brand).toBe(item.brand.toUpperCase());
    }
  });

  test.each([
    { records: [{ ...card, maskedPan: '1234' }] },
    { records: [{ ...card, expiry: '13/28' }] },
    { records: [{ ...card, brand: '' }] },
    { records: [card, card] },
  ])(
    'rechaza tarjetas inválidas sin incluir el registro en el error',
    async ({ records }) => {
      await expect(
        new LocalCardsDataSource(records).readCards(),
      ).rejects.toThrow(/inválid|duplicados/);
    },
  );

  test('rechaza cuentas con identificadores repetidos', async () => {
    await expect(
      new LocalAccountsDataSource([account, account]).readAccounts(),
    ).rejects.toThrow('Identificadores de cuenta duplicados');
  });

  test('los repositorios delegan a los data sources inyectados', async () => {
    const accountSource = {
      readAccounts: jest.fn().mockResolvedValue([account]),
    };
    const cardSource = { readCards: jest.fn().mockResolvedValue([card]) };

    await expect(
      new MockAccountRepository(accountSource).listAccounts(),
    ).resolves.toEqual([account]);
    await expect(
      new MockCardRepository(cardSource).listCards(),
    ).resolves.toEqual([card]);
    expect(accountSource.readAccounts).toHaveBeenCalledTimes(1);
    expect(cardSource.readCards).toHaveBeenCalledTimes(1);
  });
});

test('cuentas y tarjetas rechazan estructura corrupta con mensajes públicos exactos', async () => {
  for (const input of [
    null,
    {},
    [null],
    [[{}]],
    [{ ...account, alias: ' ' }],
    [{ ...account, maskedNumber: 42 }],
    [{ ...account, maskedNumber: '1234' }],
  ]) {
    await expect(
      new LocalAccountsDataSource(input).readAccounts(),
    ).rejects.toThrow('Datos de cuentas inválidos');
  }
  for (const input of [
    null,
    {},
    [null],
    [[{}]],
    [{ ...card, cardId: ' ' }],
    [{ ...card, accountId: 42 }],
    [{ ...card, alias: '' }],
    [{ ...card, expiry: 12 }],
  ]) {
    await expect(new LocalCardsDataSource(input).readCards()).rejects.toThrow(
      'Datos de tarjetas inválidos',
    );
  }
});

test('marca desconocida se normaliza sin catálogo cerrado y cuenta sin número sigue válida', async () => {
  await expect(
    new LocalCardsDataSource([
      { ...card, brand: ' future-brand ' },
    ]).readCards(),
  ).resolves.toEqual([{ ...card, brand: 'FUTURE-BRAND' }]);
  await expect(
    new LocalAccountsDataSource([
      { accountId: ' acc_demo ', alias: ' Demo ' },
    ]).readAccounts(),
  ).resolves.toEqual([{ accountId: 'acc_demo', alias: 'Demo' }]);
});
