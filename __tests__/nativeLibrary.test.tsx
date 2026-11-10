import React from 'react';
import { Platform } from 'react-native';
import { fireEvent, render, screen } from '@testing-library/react-native';

// Mock the physical Fabric registration, preserving the package, spec and wrapper.
jest.mock(
  'react-native/Libraries/NativeComponent/NativeComponentRegistry',
  () => ({
    get: jest.fn(() => 'NativeMapHost'),
  }),
);

afterEach(() => jest.restoreAllMocks());

test.each([
  ['android', false],
  ['ios', false],
  ['android', true],
] as const)(
  'API pública y composición %s con módulo disponible=%s',
  (os, available) => {
    jest.isolateModules(() => {
      const rn = require('react-native');
      jest.replaceProperty(rn.Platform, 'OS', os);
      const native = available
        ? {
            issueSecureToken: jest.fn(),
            openSecureView: jest.fn(),
          }
        : null;
      const get = jest
        .spyOn(rn.TurboModuleRegistry, 'get')
        .mockReturnValue(native);
      const library = require('io-native-components');
      const {
        secureDependencies,
      } = require('../src/app/composition/secureDependencies');
      expect(get).toHaveBeenCalledWith('IoSecureView');
      expect(library.NativeIoSecureView).toBe(native);
      expect(typeof library.CustomMap).toBe('function');
      expect(Object.keys(library).sort()).toEqual([
        'CustomMap',
        'NativeIoSecureView',
      ]);
      if (os === 'android' && available) {
        expect(secureDependencies.tokenProvider.getOrRenewToken).toEqual(
          expect.any(Function),
        );
        expect(secureDependencies.gateway.openSecureView).toEqual(
          expect.any(Function),
        );
      } else expect(secureDependencies).toBeNull();
    });
  },
);

test('Fabric y TurboModule coexisten por API pública; props nuevas no inventan taps', async () => {
  jest.replaceProperty(Platform, 'OS', 'android');
  const { CustomMap } = require('io-native-components');
  const press = jest.fn();
  const status = jest.fn();
  const marker = {
    id: 'demo',
    latitude: -12,
    longitude: -77,
    unexpected: 'discard',
  };
  const view = await render(
    <CustomMap
      markers={[marker]}
      selectedMarkerId={null}
      onMarkerPress={press}
      onStatus={status}
    />,
  );
  const host = screen.getByLabelText('Mapa de beneficios');
  expect(host.props.markers).toEqual([
    { id: 'demo', latitude: -12, longitude: -77 },
  ]);
  expect(host.props.selectedMarkerId).toBeUndefined();
  await fireEvent(host, 'markerPress', {
    nativeEvent: { markerId: 'demo', unexpected: 'discard' },
  });
  expect(press).toHaveBeenCalledTimes(1);
  expect(press).toHaveBeenCalledWith('demo');
  await view.rerender(
    <CustomMap
      markers={[marker]}
      selectedMarkerId="demo"
      onMarkerPress={press}
      onStatus={status}
    />,
  );
  expect(
    screen.getByLabelText('Mapa de beneficios').props.selectedMarkerId,
  ).toBe('demo');
  expect(press).toHaveBeenCalledTimes(1);
  await fireEvent(screen.getByLabelText('Mapa de beneficios'), 'mapStatus', {
    nativeEvent: { status: 'UNKNOWN' },
  });
  expect(status).not.toHaveBeenCalled();
  await fireEvent(screen.getByLabelText('Mapa de beneficios'), 'mapStatus', {
    nativeEvent: { status: 'unavailable' },
  });
  expect(status).toHaveBeenCalledTimes(1);
  expect(status).toHaveBeenCalledWith('unavailable');
});

test('wrapper público iOS monta el host Fabric', async () => {
  jest.replaceProperty(Platform, 'OS', 'ios');
  const { CustomMap } = require('io-native-components');
  const press = jest.fn();
  await render(<CustomMap markers={[]} onMarkerPress={press} />);
  expect(screen.getByLabelText('Mapa de beneficios')).toBeTruthy();
  expect(press).not.toHaveBeenCalled();
});
