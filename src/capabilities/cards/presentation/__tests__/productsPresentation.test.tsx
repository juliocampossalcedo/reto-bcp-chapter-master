import React from 'react';
import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';

import type { ProductsSnapshot } from '../../application/usecases/loadProducts';
import { CardsScreen } from '../screens/CardsScreen';
import { useProductsStore } from '../store/useProductsStore';
import type {
  SecureViewEvent,
  SecureViewGateway,
} from '../../application/ports/SecureViewGateway';

const account = {
  accountId: 'acc_test',
  alias: 'Cuenta demo',
  maskedNumber: '**** 1234',
};
const card = {
  cardId: 'card_test',
  alias: 'Tarjeta demo',
  maskedPan: '**** **** **** 4321',
  brand: 'VISA',
  expiry: '09/29',
  accountId: 'acc_test',
};

beforeEach(() => {
  useProductsStore.setState(useProductsStore.getInitialState());
});

test('store pasa de idle a loading y success y evita recargas superfluas', async () => {
  let resolveLoad: (value: ProductsSnapshot) => void = () => {};
  const loader = jest.fn(
    () =>
      new Promise<ProductsSnapshot>(resolve => {
        resolveLoad = resolve;
      }),
  );

  expect(useProductsStore.getState().status).toBe('idle');
  const pending = useProductsStore.getState().load(loader);
  expect(useProductsStore.getState().status).toBe('loading');
  resolveLoad({ accounts: [account], cards: [card] });
  await pending;
  expect(useProductsStore.getState().status).toBe('success');
  await useProductsStore.getState().load(loader);
  expect(loader).toHaveBeenCalledTimes(1);
  expect(useProductsStore.getState().cards[0].maskedPan).toBe(
    '**** **** **** 4321',
  );
});

test('pantalla muestra carga, datos seguros y acción deshabilitada', async () => {
  let resolveLoad: (value: ProductsSnapshot) => void = () => {};
  const loader = jest.fn(
    () =>
      new Promise<ProductsSnapshot>(resolve => {
        resolveLoad = resolve;
      }),
  );
  await render(<CardsScreen loadProducts={loader} />);
  expect(screen.getByText('Cargando productos...')).toBeTruthy();
  resolveLoad({ accounts: [account], cards: [card] });
  expect(await screen.findByText('Cuenta demo')).toBeTruthy();
  expect(screen.getByText('Tarjeta demo')).toBeTruthy();
  expect(screen.getByText('VISA')).toBeTruthy();
  expect(screen.getByText('**** **** **** 4321')).toBeTruthy();
  expect(screen.getByText('Vence 09/29')).toBeTruthy();
  expect(
    screen.getByRole('button', { name: 'Ver datos sensibles' }).props
      .accessibilityState,
  ).toEqual({ disabled: true });
  expect(
    screen.getByText('Vista segura no disponible en este dispositivo'),
  ).toBeTruthy();
});

test('pantalla vacía y reintento muestran los datos al responder el repositorio', async () => {
  const loader = jest
    .fn<Promise<ProductsSnapshot>, []>()
    .mockResolvedValueOnce({ accounts: [], cards: [] })
    .mockResolvedValueOnce({ accounts: [account], cards: [card] });
  await render(<CardsScreen loadProducts={loader} />);
  expect(
    await screen.findByText('Aún no tienes productos para mostrar'),
  ).toBeTruthy();
  await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByText('Cuenta demo')).toBeTruthy();
  expect(loader).toHaveBeenCalledTimes(2);
});

test('error público permite reintentar y recuperar', async () => {
  const loader = jest
    .fn<Promise<ProductsSnapshot>, []>()
    .mockRejectedValueOnce(new Error('dato interno privado'))
    .mockResolvedValueOnce({ accounts: [account], cards: [card] });
  await render(<CardsScreen loadProducts={loader} />);
  expect(
    await screen.findByText('No pudimos mostrar tus productos'),
  ).toBeTruthy();
  expect(
    screen.getByText('No pudimos cargar tus productos. Intenta nuevamente.'),
  ).toBeTruthy();
  expect(screen.queryByText('dato interno privado')).toBeNull();
  await fireEvent.press(screen.getByRole('button', { name: 'Reintentar' }));
  expect(await screen.findByText('Cuenta demo')).toBeTruthy();
  expect(loader).toHaveBeenCalledTimes(2);
});

test.each([
  [
    { accounts: [account], cards: [] },
    'No hay tarjetas para mostrar.',
    'Cuenta demo',
  ],
  [
    { accounts: [], cards: [card] },
    'No hay cuentas para mostrar.',
    'Tarjeta demo',
  ],
] as const)(
  'colección parcial muestra la sección disponible',
  async (snapshot, emptyText, itemText) => {
    useProductsStore.setState({ ...snapshot, status: 'success' });
    await render(<CardsScreen loadProducts={jest.fn()} />);
    await waitFor(() => expect(screen.getByText(emptyText)).toBeTruthy());
    expect(screen.getByText(itemText)).toBeTruthy();
  },
);

test('acción Android usa la tarjeta elegida y se libera al cerrar', async () => {
  useProductsStore.setState({
    accounts: [account],
    cards: [card],
    status: 'success',
  });
  let listener: (event: SecureViewEvent) => void = () => {};
  const gateway = {
    openSecureView: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn(callback => {
      listener = callback;
      return jest.fn();
    }),
  } as SecureViewGateway;
  const tokenProvider = {
    getOrRenewToken: jest
      .fn()
      .mockResolvedValue({ value: 'opaque', expiresAtEpochMs: 1000 }),
  };
  await render(
    <CardsScreen
      loadProducts={jest.fn()}
      secureAccess={{ gateway, tokenProvider }}
    />,
  );
  await fireEvent.press(
    screen.getByRole('button', { name: 'Ver datos sensibles' }),
  );
  expect(tokenProvider.getOrRenewToken).toHaveBeenCalledWith('card_test');
  expect(gateway.openSecureView).toHaveBeenCalledWith({
    cardId: 'card_test',
    secureToken: 'opaque',
  });
  expect(
    screen.getByRole('button', { name: 'Ver datos sensibles' }).props
      .accessibilityState,
  ).toEqual({ disabled: true });
  await act(() => {
    listener({
      name: 'onSecureViewOpened',
      payload: { cardId: 'card_test' },
    });
    listener({
      name: 'onCardDataShown',
      payload: { cardId: 'card_test' },
    });
  });
  await act(() =>
    listener({
      name: 'onSecureViewClosed',
      payload: { cardId: 'card_test', reason: 'USER_DISMISS' },
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Ver datos sensibles' }).props
        .accessibilityState,
    ).toEqual({ disabled: false }),
  );
});

test('error de validación mantiene el control bloqueado hasta cerrar la vista nativa', async () => {
  useProductsStore.setState({
    accounts: [account],
    cards: [card],
    status: 'success',
  });
  let listener: (event: SecureViewEvent) => void = () => {};
  const gateway = {
    openSecureView: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn(callback => {
      listener = callback;
      return jest.fn();
    }),
  } as SecureViewGateway;
  const tokenProvider = {
    getOrRenewToken: jest
      .fn()
      .mockResolvedValue({ value: 'opaque', expiresAtEpochMs: 1000 }),
  };
  await render(
    <CardsScreen
      loadProducts={jest.fn()}
      secureAccess={{ gateway, tokenProvider }}
    />,
  );
  await fireEvent.press(
    screen.getByRole('button', { name: 'Ver datos sensibles' }),
  );
  await act(() =>
    listener({
      name: 'onValidationError',
      payload: {
        code: 'TOKEN_INVALID',
        message: 'No se pudo validar el acceso.',
      },
    }),
  );
  expect(
    screen.getByRole('button', { name: 'Ver datos sensibles' }).props
      .accessibilityState,
  ).toEqual({ disabled: true });
  await act(() =>
    listener({
      name: 'onSecureViewClosed',
      payload: { cardId: 'card_test', reason: 'USER_DISMISS' },
    }),
  );
  await waitFor(() =>
    expect(
      screen.getByRole('button', { name: 'Ver datos sensibles' }).props
        .accessibilityState,
    ).toEqual({ disabled: false }),
  );
});

test.each(['resolve', 'reject'] as const)(
  'store ignora respuesta obsoleta %s después de reintento',
  async outcome => {
    let resolve!: (value: ProductsSnapshot) => void;
    let reject!: (reason: Error) => void;
    const old = useProductsStore.getState().load(
      () =>
        new Promise<ProductsSnapshot>((yes, no) => {
          resolve = yes;
          reject = no;
        }),
    );
    const current = { accounts: [account], cards: [card] };
    await useProductsStore.getState().load(async () => current, true);
    if (outcome === 'resolve') resolve({ accounts: [], cards: [] });
    else reject(new Error('discard'));
    await old;
    expect(useProductsStore.getState()).toMatchObject({
      ...current,
      status: 'success',
      errorMessage: null,
    });
  },
);

test.each(['token', 'open'] as const)(
  'fallo de %s muestra error seguro, libera control y permite renovar',
  async phase => {
    useProductsStore.setState({
      accounts: [account],
      cards: [card],
      status: 'success',
    });
    const tokenProvider = {
      getOrRenewToken: jest
        .fn()
        .mockResolvedValue({ value: 'opaque-demo', expiresAtEpochMs: 1000 }),
    };
    const gateway = {
      openSecureView: jest.fn().mockResolvedValue(undefined),
      subscribe: jest.fn(() => jest.fn()),
    };
    if (phase === 'token')
      tokenProvider.getOrRenewToken.mockRejectedValueOnce(
        new Error('internal-discard'),
      );
    else
      gateway.openSecureView.mockRejectedValueOnce(
        new Error('internal-discard'),
      );
    await render(
      <CardsScreen
        loadProducts={jest.fn()}
        secureAccess={{ tokenProvider, gateway }}
      />,
    );
    await fireEvent.press(
      screen.getByRole('button', { name: 'Ver datos sensibles' }),
    );
    expect(await screen.findByRole('alert')).toHaveTextContent(
      'No se pudo abrir la vista segura. Intenta nuevamente.',
    );
    expect(screen.queryByText('internal-discard')).toBeNull();
    expect(
      screen.getByRole('button', { name: 'Ver datos sensibles' }),
    ).toBeEnabled();
    if (phase === 'token')
      expect(gateway.openSecureView).not.toHaveBeenCalled();
    await fireEvent.press(
      screen.getByRole('button', { name: 'Ver datos sensibles' }),
    );
    expect(tokenProvider.getOrRenewToken).toHaveBeenCalledTimes(2);
    expect(gateway.openSecureView).toHaveBeenLastCalledWith({
      cardId: card.cardId,
      secureToken: 'opaque-demo',
    });
    expect(Object.keys(useProductsStore.getState()).sort()).toEqual([
      'accounts',
      'cards',
      'errorMessage',
      'load',
      'status',
    ]);
  },
);

test('taps durante emisión no duplican apertura y unmount retira la suscripción', async () => {
  useProductsStore.setState({
    accounts: [account],
    cards: [card],
    status: 'success',
  });
  let resolve!: (value: { value: string; expiresAtEpochMs: number }) => void;
  const tokenProvider = {
    getOrRenewToken: jest.fn(
      () =>
        new Promise<{ value: string; expiresAtEpochMs: number }>(yes => {
          resolve = yes;
        }),
    ),
  };
  const unsubscribe = jest.fn();
  const gateway = {
    openSecureView: jest.fn().mockResolvedValue(undefined),
    subscribe: jest.fn(() => unsubscribe),
  };
  const view = await render(
    <CardsScreen
      loadProducts={jest.fn()}
      secureAccess={{ tokenProvider, gateway }}
    />,
  );
  await fireEvent.press(
    screen.getByRole('button', { name: 'Ver datos sensibles' }),
  );
  await fireEvent.press(
    screen.getByRole('button', { name: 'Ver datos sensibles' }),
  );
  expect(tokenProvider.getOrRenewToken).toHaveBeenCalledTimes(1);
  await act(() => resolve({ value: 'opaque-demo', expiresAtEpochMs: 1000 }));
  expect(gateway.openSecureView).toHaveBeenCalledTimes(1);
  expect(gateway.subscribe).toHaveBeenCalledTimes(1);
  await view.unmount();
  expect(unsubscribe).toHaveBeenCalledTimes(1);
});
