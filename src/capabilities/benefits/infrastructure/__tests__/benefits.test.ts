import { LocalBenefitsDataSource } from '../datasources/LocalBenefitsDataSource';
import { MockBenefitRepository } from '../repositories/MockBenefitRepository';
import {
  loadEligibleBenefits,
  validCoordinates,
} from '../../application/usecases/loadEligibleBenefits';
import { benefitToMapMarker } from '../../presentation/mappers/benefitToMapMarker';
import { RepositoryCardBrandsReader } from '../../../../app/composition/benefitsDependencies';
import fixtures from '../mocks/benefits.json';

const source = (input: unknown = fixtures) =>
  new LocalBenefitsDataSource(input);
const load = (brands: readonly string[], input: unknown = fixtures) =>
  loadEligibleBenefits(new MockBenefitRepository(source(input)), {
    getAvailableBrands: async () => brands,
  });

test('mock, allowlist y normalización sin mutar entrada', async () => {
  const input = {
    ...fixtures[0],
    extra: 'discard',
    applicableBrands: [' visa ', 'VISA'],
  };
  const [record] = await source([input]).readBenefits();
  expect(record.applicableBrands).toEqual(['VISA']);
  expect(Object.keys(record)).toHaveLength(9);
  expect(record).not.toHaveProperty('extra');
  expect(input.applicableBrands).toEqual([' visa ', 'VISA']);
  expect(await source().readBenefits()).toHaveLength(4);
});
test.each([
  null,
  {},
  [null],
  [{ ...fixtures[0], id: 0 }],
  [{ ...fixtures[0], id: 1.1 }],
  [fixtures[0], fixtures[0]],
  [{ ...fixtures[0], title: '' }],
  [{ ...fixtures[0], latitude: '0' }],
  [{ ...fixtures[0], applicableBrands: [null] }],
])('datos estructurales inválidos producen error seguro %#', async input => {
  await expect(source(input).readBenefits()).rejects.toThrow(
    'Datos de beneficios inválidos',
  );
});
test('elegibilidad por intersección normalizada estable, multimarcas una vez', async () => {
  expect((await load([' visa ', 'VISA'])).benefits.map(b => b.id)).toEqual([
    1, 3,
  ]);
  expect((await load(['VISA', 'mastercard'])).benefits.map(b => b.id)).toEqual([
    1, 2, 3,
  ]);
  expect((await load([])).benefits).toEqual([]);
  expect((await load(['OTHER'])).benefits).toEqual([]);
  expect(
    (await load(['VISA'], [{ ...fixtures[0], applicableBrands: [] }])).benefits,
  ).toEqual([]);
});
test.each([
  [90, 180, true],
  [-90, -180, true],
  [0, 0, true],
  [91, 0, false],
  [0, 181, false],
  [NaN, 0, false],
  [0, Infinity, false],
  [null, 0, false],
  ['1', 0, false],
  [undefined, 0, false],
])('coordenadas %p %p', (lat, lon, expected) => {
  expect(validCoordinates(lat, lon)).toBe(expected);
});
test('ubicaciones parcialmente inválidas se omiten; todas inválidas son error distinto a empty', async () => {
  const bad = { ...fixtures[0], latitude: NaN };
  expect(await load(['VISA'], [bad, fixtures[2]])).toMatchObject({
    omittedLocations: 1,
    benefits: [fixtures[2]],
  });
  await expect(load(['VISA'], [bad])).rejects.toThrow('Ubicaciones');
});
test('mapper proyecta exclusivamente los cuatro campos públicos', () => {
  expect(benefitToMapMarker(fixtures[0])).toEqual({
    id: '1',
    title: fixtures[0].title,
    latitude: fixtures[0].latitude,
    longitude: fixtures[0].longitude,
  });
});
test('repositorio delega y ambos errores se propagan sin mostrar todos', async () => {
  const failure = new Error('source failed');
  await expect(
    new MockBenefitRepository({
      readBenefits: async () => {
        throw failure;
      },
    }).listBenefits(),
  ).rejects.toBe(failure);
  await expect(
    loadEligibleBenefits(new MockBenefitRepository(source()), {
      getAvailableBrands: async () => {
        throw failure;
      },
    }),
  ).rejects.toBe(failure);
});
test('reader reutiliza repositorio, normaliza/deduplica y propaga fallos', async () => {
  const card = {
    cardId: 'a',
    accountId: 'b',
    alias: 'Demo',
    brand: ' visa ',
    maskedPan: '**** **** **** 1234',
    expiry: '12/28',
  };
  const listCards = jest
    .fn()
    .mockResolvedValue([
      card,
      { ...card, brand: 'VISA' },
      { ...card, brand: ' ' },
    ]);
  const reader = new RepositoryCardBrandsReader({ listCards });
  expect(await reader.getAvailableBrands()).toEqual(['VISA']);
  listCards.mockResolvedValueOnce([]);
  expect(await reader.getAvailableBrands()).toEqual([]);
  listCards.mockRejectedValueOnce(new Error('failed'));
  await expect(reader.getAvailableBrands()).rejects.toThrow('failed');
});
