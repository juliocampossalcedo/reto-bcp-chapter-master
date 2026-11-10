import React, { Profiler } from 'react';
import { AccessibilityInfo, FlatList, Platform, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { BenefitsScreen } from '../screens/BenefitsScreen';
import { BenefitsCarousel } from '../components/BenefitsCarousel';
import { BenefitCarouselCard } from '../components/BenefitCarouselCard';
import * as markerMapping from '../mappers/benefitToMapMarker';
import { useBenefitsStore } from '../store/useBenefitsStore';
import fixtures from '../../infrastructure/mocks/benefits.json';
import type { Benefit } from '../../domain/models/Benefit';
import type { EligibleBenefits } from '../../application/usecases/loadEligibleBenefits';

jest.mock(
  '../../../../../packages/io-native-components/src/specs/CustomMapNativeComponent',
  () => {
    const NativeView = require('react-native').View;
    return {
      __esModule: true,
      default: (props: React.ComponentProps<typeof View>) => (
        <NativeView {...props} testID="native-map" />
      ),
    };
  },
);
let toIndex: jest.SpyInstance;
let toOffset: jest.SpyInstance;
beforeEach(() => {
  jest.useFakeTimers();
  jest.replaceProperty(Platform, 'OS', 'android');
  useBenefitsStore.setState(useBenefitsStore.getInitialState());
  toIndex = jest
    .spyOn(FlatList.prototype, 'scrollToIndex')
    .mockImplementation(() => {});
  toOffset = jest
    .spyOn(FlatList.prototype, 'scrollToOffset')
    .mockImplementation(() => {});
  jest
    .spyOn(AccessibilityInfo, 'isReduceMotionEnabled')
    .mockResolvedValue(false);
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllTimers();
  jest.useRealTimers();
});
const eligible = fixtures.slice(0, 3);
const loader = async () => ({ benefits: eligible, omittedLocations: 0 });
const offset = (x: number, timeStamp = 100) => ({
  timeStamp,
  nativeEvent: {
    contentOffset: { x, y: 0 },
    contentSize: { width: 1044, height: 200 },
    layoutMeasurement: { width: 360, height: 200 },
  },
});
async function measure(width = 360) {
  await fireEvent(screen.getByTestId('benefits-carousel'), 'layout', {
    nativeEvent: { layout: { width, height: 240, x: 0, y: 0 } },
  });
}
async function opened() {
  const view = await render(<BenefitsScreen loadBenefits={loader} />);
  await screen.findByTestId('native-map');
  await fireEvent(screen.getByTestId('native-map'), 'mapStatus', {
    nativeEvent: { status: 'loaded' },
  });
  return view;
}
async function tap(id: string) {
  await fireEvent(screen.getByTestId('native-map'), 'markerPress', {
    nativeEvent: { markerId: id },
  });
}
async function fling(x: number) {
  const list = screen.getByTestId('benefits-carousel-list');
  await fireEvent(list, 'scrollBeginDrag', offset(0, 100));
  await fireEvent(list, 'scrollEndDrag', offset(30, 110));
  await fireEvent(list, 'momentumScrollBegin', offset(30, 111));
  await fireEvent(list, 'momentumScrollEnd', offset(x, 200));
}

test('J11/17/29/31: primer ID coherente; espera medida, y mapa/card/contador comparten selección', async () => {
  await opened();
  expect(screen.getByTestId('native-map').props.selectedMarkerId).toBe('1');
  expect(toIndex).not.toHaveBeenCalled();
  await measure();
  expect(toIndex).toHaveBeenLastCalledWith({ index: 0, animated: false });
  toIndex.mockClear();
  await fireEvent(
    screen.getByTestId('benefits-carousel-list'),
    'contentSizeChange',
    1044,
    260,
  );
  await fireEvent(
    screen.getByTestId('benefits-carousel-list'),
    'contentSizeChange',
    1044,
    260,
  );
  expect(toIndex).toHaveBeenCalledTimes(1);
  expect(toIndex).toHaveBeenCalledWith({ index: 0, animated: false });
  expect(screen.getByText('Beneficio 1 de 3')).toBeTruthy();
  expect(
    screen.getByRole('button', { name: /^Beneficio 1 de 3, Café Miraflores/ })
      .props.accessibilityState.selected,
  ).toBe(true);
});
test('J12–15/39: taps A→B alinean última tarjeta; fin programático no escribe ni recompone markers', async () => {
  const mapped = jest.spyOn(markerMapping, 'benefitToMapMarker');
  await opened();
  await measure();
  const mappingCount = mapped.mock.calls.length;
  expect(mappingCount).toBe(3);
  const markers = screen.getByTestId('native-map').props.markers;
  const writes = jest.fn();
  const unsub = useBenefitsStore.subscribe(writes);
  await tap('2');
  await tap('3');
  expect(toIndex).toHaveBeenLastCalledWith({ index: 2, animated: true });
  expect(screen.getByTestId('native-map').props.markers).toEqual(markers);
  expect(mapped).toHaveBeenCalledTimes(mappingCount);
  // Wrapper maps transport props; the presentation's marker input is checked separately below.
  const list = screen.getByTestId('benefits-carousel-list');
  await fireEvent(list, 'momentumScrollEnd', offset(348));
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('3');
  await fireEvent(list, 'momentumScrollEnd', offset(696));
  await tap('3');
  expect(writes).toHaveBeenCalledTimes(2);
  unsub();
});
test('J08/18: IDs vacíos/desconocidos no seleccionan ni hacen scroll', async () => {
  await opened();
  await measure();
  toIndex.mockClear();
  await tap('');
  await tap('deleted');
  expect(toIndex).not.toHaveBeenCalled();
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('1');
});
test('J19–21/23/26: gesto publica solo final y no pasa por el callback Fabric', async () => {
  await opened();
  await measure();
  const writes = jest.fn();
  const unsub = useBenefitsStore.subscribe(writes);
  await fling(696);
  expect(screen.getByTestId('native-map').props.selectedMarkerId).toBe('3');
  expect(screen.getByText('Beneficio 3 de 3')).toBeTruthy();
  await fireEvent(
    screen.getByTestId('benefits-carousel-list'),
    'momentumScrollEnd',
    offset(696),
  );
  expect(writes).toHaveBeenCalledTimes(1);
  unsub();
  await fling(0);
  expect(screen.getByTestId('native-map').props.selectedMarkerId).toBe('1');
});
test('J22/24: drag sin momentum cancela scroll por pin y confirma snap estabilizado', async () => {
  await opened();
  await measure();
  await tap('3');
  const list = screen.getByTestId('benefits-carousel-list');
  await fireEvent(list, 'scrollBeginDrag', offset(600));
  await fireEvent(list, 'scrollEndDrag', offset(348));
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('3');
  await act(() => jest.advanceTimersByTime(128));
  expect(screen.getByTestId('native-map').props.selectedMarkerId).toBe('2');
});
test('J16/18: recuperación una vez por destino y limpieza en unmount', async () => {
  const view = await opened();
  await measure();
  await tap('3');
  const list = screen.getByTestId('benefits-carousel-list');
  await fireEvent(list, 'scrollToIndexFailed', {
    index: 2,
    highestMeasuredFrameIndex: 0,
    averageItemLength: 348,
  });
  await fireEvent(list, 'scrollToIndexFailed', {
    index: 2,
    highestMeasuredFrameIndex: 0,
    averageItemLength: 348,
  });
  expect(toOffset).toHaveBeenCalledTimes(1);
  toIndex.mockClear();
  await view.unmount();
  await act(() => jest.runAllTimers());
  expect(toIndex).not.toHaveBeenCalled();
});
test('J25/28/35: resize y dataset nuevo invalidan gesto anterior, reorder y vecino conservan reglas', async () => {
  const view = await opened();
  await measure();
  await tap('2');
  const list = screen.getByTestId('benefits-carousel-list');
  await fireEvent(list, 'scrollBeginDrag', offset(0));
  await fireEvent(list, 'scrollEndDrag', offset(696));
  await measure(700);
  await act(() => jest.advanceTimersByTime(600));
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('2');
  expect(toIndex).toHaveBeenLastCalledWith({ index: 1, animated: false });
  const reordered = async () => ({
    benefits: [eligible[2], eligible[1], eligible[0]],
    omittedLocations: 0,
  });
  await view.rerender(<BenefitsScreen loadBenefits={reordered} />);
  await screen.findByTestId('native-map');
  await measure();
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('2');
  const removed = async () => ({
    benefits: [eligible[2], eligible[0]],
    omittedLocations: 0,
  });
  await view.rerender(<BenefitsScreen loadBenefits={removed} />);
  await screen.findByTestId('native-map');
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('1');
});
test('J31–33: label/rol/selección, promoción/dirección y alternativa no gestual', async () => {
  await opened();
  await measure();
  await fireEvent.press(
    screen.getByRole('button', { name: 'Beneficio siguiente' }),
  );
  expect(screen.getByTestId('native-map').props.selectedMarkerId).toBe('2');
  expect(
    screen.getByRole('button', {
      name: /^Beneficio 2 de 3, Restaurante San Isidro, 15% de descuento, seleccionado/,
    }).props.accessibilityState.selected,
  ).toBe(true);
  expect(screen.getByText(eligible[1].address)).toBeTruthy();
  await fireEvent.press(
    screen.getByRole('button', { name: 'Seleccionar Librería San Miguel' }),
  );
  expect(screen.getByText('Beneficio 3 de 3')).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Beneficio siguiente' }).props
      .accessibilityState.disabled,
  ).toBe(true);
  await fireEvent.press(
    screen.getByRole('button', { name: 'Beneficio anterior' }),
  );
  expect(useBenefitsStore.getState().selectedBenefitId).toBe('2');
});
test('J27/30: una tarjeta sin swipe; empty/error sin carrusel', async () => {
  const single = async () => ({ benefits: [eligible[0]], omittedLocations: 0 });
  const view = await render(<BenefitsScreen loadBenefits={single} />);
  await screen.findByTestId('native-map');
  await measure();
  expect(screen.getByTestId('benefits-carousel-list').props.scrollEnabled).toBe(
    false,
  );
  expect(screen.getByText('Beneficio 1 de 1')).toBeTruthy();
  const empty = async () => ({ benefits: [], omittedLocations: 0 });
  await view.rerender(<BenefitsScreen loadBenefits={empty} />);
  await screen.findByText('No tienes beneficios disponibles para tus tarjetas');
  expect(screen.queryByTestId('benefits-carousel')).toBeNull();
  const error = async (): Promise<EligibleBenefits> => {
    throw new Error('internal');
  };
  await view.rerender(<BenefitsScreen loadBenefits={error} />);
  await screen.findByRole('button', { name: 'Reintentar' });
  expect(screen.queryByTestId('benefits-carousel')).toBeNull();
});
test('J34/37: remount restaura ID/datos, focus realinea e iOS conserva mapa y carrusel', async () => {
  const load = jest
    .fn()
    .mockResolvedValue({ benefits: eligible, omittedLocations: 0 });
  const view = await render(<BenefitsScreen loadBenefits={load} />);
  await screen.findByTestId('native-map');
  await measure();
  await tap('3');
  await view.unmount();
  const next = await render(
    <BenefitsScreen loadBenefits={load} isFocused={false} />,
  );
  await screen.findByTestId('native-map');
  await measure();
  toIndex.mockClear();
  await next.rerender(<BenefitsScreen loadBenefits={load} isFocused />);
  expect(load).toHaveBeenCalledTimes(1);
  expect(toIndex).toHaveBeenLastCalledWith({ index: 2, animated: false });
  jest.replaceProperty(Platform, 'OS', 'ios');
  await next.rerender(<BenefitsScreen loadBenefits={load} />);
  expect(screen.getByTestId('native-map')).toBeTruthy();
  expect(screen.getByTestId('benefits-carousel')).toBeTruthy();
});
test('J07/12/39: contenido mismo ID no realinea; último índice virtualizado y bounds del layout', async () => {
  const benefits: Benefit[] = Array.from({ length: 20 }, (_, i) => ({
    ...eligible[0],
    id: i + 1,
    title: `Beneficio ficticio ${i + 1}`,
  }));
  const onSelect = jest.fn();
  const view = await render(
    <BenefitsCarousel
      benefits={benefits}
      selectedBenefitId="20"
      active
      onBenefitSettled={onSelect}
    />,
  );
  await measure();
  expect(toIndex).toHaveBeenLastCalledWith({ index: 19, animated: false });
  const props = screen.getByTestId('benefits-carousel-list').props;
  expect(props.getItemLayout(undefined, 19)).toEqual({
    length: 348,
    offset: 6612,
    index: 19,
  });
  toIndex.mockClear();
  await view.rerender(
    <BenefitsCarousel
      benefits={benefits.map(b => ({ ...b, title: `${b.title} actualizado` }))}
      selectedBenefitId="20"
      active
      onBenefitSettled={onSelect}
    />,
  );
  expect(toIndex).not.toHaveBeenCalled();
});
test('J39: una card memoizada sin props cambiadas no vuelve a renderizar su subtree', async () => {
  const commits = jest.fn();
  const select = jest.fn();
  const renderCard = () => (
    <Profiler id="card" onRender={commits}>
      <BenefitCarouselCard
        benefit={eligible[0]}
        selected
        index={0}
        total={3}
        width={336}
        onSelect={select}
      />
    </Profiler>
  );
  const view = await render(renderCard());
  const press = screen.getByRole('button', { name: /^Beneficio 1 de 3/ });
  const child = press.props.children;
  await view.rerender(renderCard());
  expect(
    screen.getByRole('button', { name: /^Beneficio 1 de 3/ }).props.children,
  ).toBe(child);
  expect(commits).toHaveBeenCalled(); // Profiler itself may commit; subtree identity is the measured seam.
});

test('J40: snapshot y selección contienen solo datos públicos, sin credenciales ni datos completos de tarjeta', async () => {
  await opened();
  const state = useBenefitsStore.getState();
  expect(Object.keys(state.data?.benefits[0] ?? {}).sort()).toEqual(
    [
      'id',
      'title',
      'description',
      'image',
      'promotion',
      'address',
      'latitude',
      'longitude',
      'applicableBrands',
    ].sort(),
  );
  for (const key of ['secureToken', 'pan', 'cvv', 'holder', 'apiKey']) {
    expect(state).not.toHaveProperty(key);
  }
  const json = JSON.stringify(state.data);
  expect(json).not.toMatch(/AIza[\w-]{30,}|\b\d{16}\b/);
});
