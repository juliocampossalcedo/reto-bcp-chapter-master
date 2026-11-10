import React from 'react';
import { Platform, View } from 'react-native';
import { act, fireEvent, render, screen } from '@testing-library/react-native';
import { CustomMap } from '../../../../../packages/io-native-components/src/CustomMap';
import { useBenefitsStore } from '../store/useBenefitsStore';
import { BenefitsScreen } from '../screens/BenefitsScreen';
import App from '../../../../../App';
import { useProductsStore } from '../../../cards/presentation/store/useProductsStore';
import fixtures from '../../infrastructure/mocks/benefits.json';
import type { EligibleBenefits } from '../../application/usecases/loadEligibleBenefits';
import type { AuthIdentity } from '../../../auth/application/ports/AuthGateway';

jest.mock('../../../../app/composition/authDependencies', () => ({
  authGateway: {
    observeSession: (listener: (identity: AuthIdentity | null) => void) => {
      listener({ uid: 'test-session' });
      return jest.fn();
    },
    signIn: jest.fn(),
    signOut: jest.fn(),
  },
}));

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
const marker = { id: '1', latitude: -12, longitude: -77, title: 'Demo' };
const data = { benefits: [fixtures[0]], omittedLocations: 0 };
beforeEach(() => {
  useBenefitsStore.setState(useBenefitsStore.getInitialState());
  jest.replaceProperty(Platform, 'OS', 'android');
});
afterEach(() => {
  jest.restoreAllMocks();
  jest.useRealTimers();
});
test('wrapper normaliza null, filtra eventos y aplica últimas props', async () => {
  const press = jest.fn();
  const status = jest.fn();
  const view = await render(
    <CustomMap
      markers={[marker]}
      selectedMarkerId={null}
      onMarkerPress={press}
      onStatus={status}
    />,
  );
  expect(
    screen.getByTestId('native-map').props.selectedMarkerId,
  ).toBeUndefined();
  for (const markerId of ['', 'removed', 42, '1']) {
    await fireEvent(screen.getByTestId('native-map'), 'markerPress', {
      nativeEvent: { markerId },
    });
  }
  expect(press).toHaveBeenCalledTimes(1);
  expect(press).toHaveBeenCalledWith('1');
  await fireEvent(screen.getByTestId('native-map'), 'mapStatus', {
    nativeEvent: { status: 'loaded' },
  });
  expect(status).toHaveBeenCalledWith('loaded');
  await view.rerender(
    <CustomMap markers={[]} selectedMarkerId="unknown" onMarkerPress={press} />,
  );
  expect(screen.getByTestId('native-map').props.markers).toEqual([]);
  await fireEvent(screen.getByTestId('native-map'), 'markerPress', {
    nativeEvent: { markerId: '1' },
  });
  expect(press).toHaveBeenCalledTimes(1);
});
test('carga pendiente, selección controlada y alternativa accesible', async () => {
  let resolve: (value: EligibleBenefits) => void = () => {};
  const loader = () =>
    new Promise<EligibleBenefits>(r => {
      resolve = r;
    });
  await render(<BenefitsScreen loadBenefits={loader} />);
  expect(screen.getByRole('progressbar')).toBeTruthy();
  await act(() => resolve(data));
  expect(
    await screen.findByText('1 beneficios disponibles para tus tarjetas'),
  ).toBeTruthy();
  await fireEvent(screen.getByTestId('native-map'), 'mapStatus', {
    nativeEvent: { status: 'loaded' },
  });
  await fireEvent(screen.getByTestId('native-map'), 'markerPress', {
    nativeEvent: { markerId: '1' },
  });
  expect(screen.getByTestId('native-map').props.selectedMarkerId).toBe('1');
  expect(
    screen.getByText(`Beneficio seleccionado: ${fixtures[0].title}`),
  ).toBeTruthy();
  expect(
    screen.getByRole('button', { name: `Seleccionar ${fixtures[0].title}` }),
  ).toBeTruthy();
});
test('empty legítimo no monta mapa', async () => {
  await render(
    <BenefitsScreen
      loadBenefits={async () => ({ benefits: [], omittedLocations: 0 })}
    />,
  );
  expect(
    await screen.findByText(
      'No tienes beneficios disponibles para tus tarjetas',
    ),
  ).toBeTruthy();
  expect(screen.queryByTestId('native-map')).toBeNull();
});
test('error público y reintento recuperan sin revelar payload', async () => {
  const loader = jest
    .fn()
    .mockRejectedValueOnce(new Error('private detail'))
    .mockResolvedValue(data);
  await render(<BenefitsScreen loadBenefits={loader} />);
  await screen.findByRole('button', { name: 'Reintentar' });
  expect(screen.queryByText('private detail')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByTestId('native-map')).toBeTruthy();
});
test('indisponibilidad nativa y timeout permiten reintentar sin spinner infinito', async () => {
  jest.useFakeTimers();
  await render(<BenefitsScreen loadBenefits={async () => data} />);
  await screen.findByTestId('native-map');
  await act(() => jest.advanceTimersByTime(20000));
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
  await screen.findByTestId('native-map');
  await fireEvent(screen.getByTestId('native-map'), 'mapStatus', {
    nativeEvent: { status: 'unavailable' },
  });
  expect(screen.getByRole('button', { name: 'Reintentar' })).toBeTruthy();
});
test('resultado obsoleto tras nueva carga se ignora; desmontaje no actualiza estado', async () => {
  let resolve: (value: EligibleBenefits) => void = () => {};
  const view = await render(
    <BenefitsScreen
      loadBenefits={() =>
        new Promise<EligibleBenefits>(r => {
          resolve = r;
        })
      }
    />,
  );
  await view.rerender(
    <BenefitsScreen
      loadBenefits={async () => ({ benefits: [], omittedLocations: 0 })}
    />,
  );
  await screen.findByText('No tienes beneficios disponibles para tus tarjetas');
  await act(() => resolve(data));
  expect(screen.queryByTestId('native-map')).toBeNull();
  await view.unmount();
});
test('iOS carga beneficios y monta el mapa nativo', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const loader = jest.fn(async () => data);
  await render(<BenefitsScreen loadBenefits={loader} />);
  expect(await screen.findByTestId('native-map')).toBeTruthy();
  expect(loader).toHaveBeenCalledTimes(1);
});

jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
test('Dashboard Android conserva productos y selección entre tabs', async () => {
  useProductsStore.setState(useProductsStore.getInitialState());
  await render(<App />);
  await screen.findByText('Cuenta principal');
  const snapshot = useProductsStore.getState().cards;
  await fireEvent.press(screen.getByRole('button', { name: 'Beneficios' }));
  await screen.findByTestId('native-map');
  expect(
    screen
      .getByTestId('native-map')
      .props.markers.map((m: { id: string }) => m.id),
  ).toEqual(['1', '2', '3']);
  await fireEvent(screen.getByTestId('native-map'), 'mapStatus', {
    nativeEvent: { status: 'loaded' },
  });
  await fireEvent(screen.getByTestId('native-map'), 'markerPress', {
    nativeEvent: { markerId: '3' },
  });
  await fireEvent.press(screen.getByRole('button', { name: 'Mis productos' }));
  expect(await screen.findByText('Cuenta principal')).toBeTruthy();
  expect(useProductsStore.getState().cards).toBe(snapshot);
  await fireEvent.press(screen.getByRole('button', { name: 'Beneficios' }));
  expect(screen.getByTestId('native-map').props.selectedMarkerId).toBe('3');
});
