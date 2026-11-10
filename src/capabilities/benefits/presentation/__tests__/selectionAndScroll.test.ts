import { reconcileBenefitSelection } from '../utils/reconcileBenefitSelection';
import {
  CarouselCoordinator,
  carouselGeometry,
} from '../utils/CarouselCoordinator';
import { useBenefitsStore } from '../store/useBenefitsStore';
import fixtures from '../../infrastructure/mocks/benefits.json';
import { loadEligibleBenefits } from '../../application/usecases/loadEligibleBenefits';
import { LocalBenefitsDataSource } from '../../infrastructure/datasources/LocalBenefitsDataSource';
import { MockBenefitRepository } from '../../infrastructure/repositories/MockBenefitRepository';
import { benefitToMapMarker } from '../mappers/benefitToMapMarker';
import type { EligibleBenefits } from '../../application/usecases/loadEligibleBenefits';

beforeEach(() => {
  jest.useFakeTimers();
  useBenefitsStore.setState(useBenefitsStore.getInitialState());
});
afterEach(() => {
  jest.clearAllTimers();
  jest.useRealTimers();
});
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};
const snapshot = { benefits: fixtures.slice(0, 3), omittedLocations: 0 };

test('J01–02: identidad y mismo conjunto de elegibles ubicables, sin reintroducir AMEX ni omitidos', async () => {
  const result = await loadEligibleBenefits(
    new MockBenefitRepository(
      new LocalBenefitsDataSource([
        ...fixtures,
        { ...fixtures[0], id: 50, latitude: 100 },
      ]),
    ),
    { getAvailableBrands: async () => ['VISA', 'MASTERCARD'] },
  );
  expect(result.benefits.map(b => String(b.id))).toEqual(
    result.benefits.map(benefitToMapMarker).map(m => m.id),
  );
  expect(result.benefits.map(b => b.id)).toEqual([1, 2, 3]);
  expect(result.omittedLocations).toBe(1);
});
test.each([
  [[], [], null, null],
  [[], ['1', '2'], null, '1'],
  [[], ['4'], null, '4'],
  [['1', '2', '3'], ['3', '2', '4'], '2', '2'],
  [['1', '2', '3'], ['1', '3', '4'], '2', '3'],
  [['1', '2', '3'], ['4'], '3', '4'],
  [['1'], [], '1', null],
] as const)(
  'J03–07: reconciliar por ID/vecino %#',
  (previous, next, selected, expected) => {
    expect(reconcileBenefitSelection(previous, next, selected)).toBe(expected);
  },
);
test('J04/07/08/10: selección idempotente, ID inválido ignorado, contenido nuevo y reorder mantienen identidad', async () => {
  const store = useBenefitsStore;
  store.getState().startLoad(async () => snapshot);
  await flush();
  const observed = jest.fn();
  const unsub = store.subscribe(observed);
  store.getState().selectBenefit('2');
  store.getState().selectBenefit('2');
  store.getState().selectBenefit('');
  store.getState().selectBenefit('removed');
  expect(observed).toHaveBeenCalledTimes(1);
  unsub();
  store.getState().startLoad(
    async () => ({
      ...snapshot,
      benefits: [fixtures[2], { ...fixtures[1], title: 'Updated' }],
    }),
    true,
  );
  await flush();
  expect(store.getState().selectedBenefitId).toBe('2');
  store
    .getState()
    .startLoad(async () => ({ ...snapshot, benefits: [fixtures[0]] }), true);
  await flush();
  store.getState().selectBenefit('2');
  expect(store.getState().selectedBenefitId).toBe('1');
});
test('J09/18/27: B gana a A, cancelación de carga y empty no resucitan selección', async () => {
  let resolveA: (data: EligibleBenefits) => void = () => {};
  const cancel = useBenefitsStore.getState().startLoad(
    () =>
      new Promise<EligibleBenefits>(r => {
        resolveA = r;
      }),
  );
  await flush();
  useBenefitsStore
    .getState()
    .startLoad(async () => ({ benefits: [fixtures[2]], omittedLocations: 0 }));
  await flush();
  resolveA(snapshot);
  await flush();
  cancel();
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('3');
  const pending = useBenefitsStore
    .getState()
    .startLoad(async () => snapshot, true);
  pending();
  await flush();
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('3');
  useBenefitsStore
    .getState()
    .startLoad(async () => ({ benefits: [], omittedLocations: 0 }));
  await flush();
  expect(useBenefitsStore.getState().selectedBenefitId).toBeNull();
});
test('J34–35: snapshot de sesión evita recargas al remount y actualización oculta reconcilia por ID', async () => {
  const loader = jest.fn().mockResolvedValue(snapshot);
  const cleanup = useBenefitsStore.getState().startLoad(loader);
  await flush();
  cleanup();
  useBenefitsStore.getState().selectBenefit('2');
  useBenefitsStore.getState().startLoad(loader);
  await flush();
  expect(loader).toHaveBeenCalledTimes(1);
  useBenefitsStore
    .getState()
    .startLoad(
      async () => ({ benefits: [fixtures[2]], omittedLocations: 0 }),
      true,
    );
  await flush();
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('3');
});
function controller(ids: readonly string[] = ['1', '2', '3'], stride = 300) {
  const port = { toIndex: jest.fn(), toOffset: jest.fn() };
  const settled = jest.fn();
  const sync = new CarouselCoordinator(port, settled);
  sync.configure(ids, stride, true);
  return { sync, port, settled };
}
test('J12–15: índice lejano, programático sin eco, A→B e ID inválido', () => {
  const { sync, port, settled } = controller(
    Array.from({ length: 20 }, (_, i) => String(i + 1)),
  );
  sync.align('20', true);
  expect(port.toIndex).toHaveBeenLastCalledWith(19, true);
  sync.align('1', true);
  sync.align('3', true);
  sync.momentumEnd(0);
  sync.failed(2);
  jest.runAllTimers();
  expect(port.toIndex).toHaveBeenLastCalledWith(2, false);
  sync.momentumEnd(600);
  expect(settled).not.toHaveBeenCalled();
  const calls = port.toIndex.mock.calls.length;
  sync.align('unknown', true);
  sync.align('', true);
  sync.align(null, true);
  expect(port.toIndex).toHaveBeenCalledTimes(calls);
});
test('J16–18: recuperación una vez y cancelaciones por resize, dataset, blur y unmount', () => {
  const { sync, port } = controller();
  sync.align('3', true);
  sync.failed(2);
  sync.failed(2);
  expect(port.toOffset).toHaveBeenCalledTimes(1);
  expect(port.toOffset).toHaveBeenCalledWith(600);
  sync.configure(['1', '2', '3'], 250, true);
  jest.runAllTimers();
  expect(port.toIndex).toHaveBeenCalledTimes(1);
  sync.align('2', true);
  sync.failed(1);
  sync.configure(['1'], 250, true);
  jest.runAllTimers();
  expect(port.toIndex).toHaveBeenCalledTimes(2);
  sync.align('1', true);
  sync.failed(0);
  sync.configure(['1'], 250, false);
  jest.runAllTimers();
  expect(port.toIndex).toHaveBeenCalledTimes(3);
  sync.configure(['1', '2'], 250, true);
  sync.align('2', true);
  sync.failed(1);
  sync.dispose();
  jest.runAllTimers();
  expect(port.toIndex).toHaveBeenCalledTimes(4);
});
test('J17/27: 0 datos/ancho sin scroll inválido; único sin gesto falso', () => {
  const { sync, port, settled } = controller([], 0);
  sync.align('1', true);
  sync.failed(-1);
  sync.beginDrag();
  sync.endDrag(200);
  jest.runAllTimers();
  expect(port.toIndex).not.toHaveBeenCalled();
  expect(settled).not.toHaveBeenCalled();
  sync.configure(['1'], 300, true);
  sync.align('1', true);
  expect(port.toIndex).toHaveBeenCalledWith(0, false);
  sync.beginDrag();
  sync.momentumBegin();
  sync.momentumEnd(300);
  expect(settled).not.toHaveBeenCalled();
});
test('J19–21/23/26: fling confirma solo el offset final, clamp y fin duplicado', () => {
  const { sync, settled } = controller();
  sync.beginDrag();
  sync.endDrag(300);
  sync.momentumBegin();
  jest.runAllTimers();
  expect(settled).not.toHaveBeenCalled();
  sync.momentumEnd(10000);
  sync.momentumEnd(10000);
  expect(settled).toHaveBeenCalledTimes(1);
  expect(settled).toHaveBeenCalledWith('3');
  sync.beginDrag();
  sync.momentumBegin();
  sync.momentumEnd(-200);
  expect(settled).toHaveBeenLastCalledWith('1');
});
test('J22: drag sin momentum espera offset final estable y snap, nunca publica por frame', () => {
  const { sync, settled } = controller();
  sync.beginDrag();
  sync.endDrag(170);
  jest.advanceTimersByTime(64);
  sync.scrollOffset(300);
  expect(settled).not.toHaveBeenCalled();
  jest.advanceTimersByTime(64);
  expect(settled).not.toHaveBeenCalled();
  jest.advanceTimersByTime(64);
  expect(settled).toHaveBeenCalledTimes(1);
  expect(settled).toHaveBeenCalledWith('2');
});
test('J22: nunca hay polling indefinido ni commit de offset sin snap', () => {
  const { sync, settled } = controller();
  sync.beginDrag();
  sync.endDrag(180);
  jest.runAllTimers();
  expect(settled).not.toHaveBeenCalled();
  expect(jest.getTimerCount()).toBe(0);
});
test('J24–25/28: drag invalida programático, timestamps y epoch descartan eventos antiguos', () => {
  const { sync, settled } = controller();
  sync.align('3', true);
  sync.failed(2);
  sync.beginDrag(100);
  sync.momentumBegin(101);
  sync.momentumEnd(600, 90);
  expect(settled).not.toHaveBeenCalled();
  sync.momentumEnd(300, 110);
  expect(settled).toHaveBeenCalledWith('2');
  sync.beginDrag();
  sync.endDrag(600);
  sync.configure(['3', '2'], 250, true);
  jest.runAllTimers();
  sync.momentumEnd(600);
  expect(settled).toHaveBeenCalledTimes(1);
  sync.beginDrag();
  sync.endDrag(250);
  sync.dispose();
  jest.runAllTimers();
  expect(settled).toHaveBeenCalledTimes(1);
});
test('J28/30: geometría compartida, width0/360/700 y single', () => {
  expect(carouselGeometry(0, 3).stride).toBe(0);
  expect(carouselGeometry(360, 3)).toEqual({
    cardWidth: 336,
    gap: 12,
    stride: 348,
  });
  expect(carouselGeometry(700, 3).stride).toBe(688);
  expect(carouselGeometry(360, 1)).toEqual({
    cardWidth: 360,
    gap: 0,
    stride: 360,
  });
});
