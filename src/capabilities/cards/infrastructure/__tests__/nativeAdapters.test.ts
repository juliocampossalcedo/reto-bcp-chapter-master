import type { IoSecureViewSpec } from 'io-native-components';
import { NativeSecureTokenProvider } from '../native/NativeSecureTokenProvider';
import { NativeSecureViewGateway } from '../native/NativeSecureViewGateway';

test('provider solicita un token nuevo por llamada y devuelve solo el contrato público', async () => {
  const issueSecureToken = jest
    .fn()
    .mockResolvedValueOnce({ value: 'opaque-1', expiresAtEpochMs: 60_000 })
    .mockResolvedValueOnce({ value: 'opaque-2', expiresAtEpochMs: 61_000 });
  const module = { issueSecureToken } as unknown as IoSecureViewSpec;
  const provider = new NativeSecureTokenProvider(module);

  await expect(provider.getOrRenewToken('card_001')).resolves.toEqual({
    value: 'opaque-1',
    expiresAtEpochMs: 60_000,
  });
  await expect(provider.getOrRenewToken('card_001')).resolves.toEqual({
    value: 'opaque-2',
    expiresAtEpochMs: 61_000,
  });
  expect(issueSecureToken).toHaveBeenCalledTimes(2);
  expect(issueSecureToken).toHaveBeenCalledWith('card_001');
});

test('provider rechaza respuestas malformadas sin mostrar el payload', async () => {
  const module = {
    issueSecureToken: jest
      .fn()
      .mockResolvedValue({ value: '', expiresAtEpochMs: Infinity }),
  } as unknown as IoSecureViewSpec;
  await expect(
    new NativeSecureTokenProvider(module).getOrRenewToken('card_001'),
  ).rejects.toThrow('No se pudo emitir');
});

test('provider rechaza un cardId vacío antes de llamar al módulo', async () => {
  const issueSecureToken = jest.fn();
  const provider = new NativeSecureTokenProvider({
    issueSecureToken,
  } as unknown as IoSecureViewSpec);

  await expect(provider.getOrRenewToken('  ')).rejects.toThrow(
    'Tarjeta no disponible',
  );
  expect(issueSecureToken).not.toHaveBeenCalled();
});

test('gateway traduce eventos y retira las cuatro suscripciones', async () => {
  const callbacks: Record<string, (payload: never) => void> = {};
  const remove = jest.fn();
  const subscribe = (name: string) => (callback: (payload: never) => void) => {
    callbacks[name] = callback;
    return { remove };
  };
  const module = {
    openSecureView: jest.fn().mockResolvedValue(true),
    onSecureViewOpened: subscribe('opened'),
    onValidationError: subscribe('error'),
    onCardDataShown: subscribe('shown'),
    onSecureViewClosed: subscribe('closed'),
  } as unknown as IoSecureViewSpec;
  const gateway = new NativeSecureViewGateway(module);
  const listener = jest.fn();
  const unsubscribe = gateway.subscribe(listener);
  await gateway.openSecureView({ cardId: 'card_001', secureToken: 'opaque' });
  expect(module.openSecureView).toHaveBeenCalledWith('card_001', 'opaque');
  callbacks.opened({ cardId: 'card_001' } as never);
  callbacks.error({ code: 'TOKEN_EXPIRED', message: 'unsafe raw' } as never);
  callbacks.shown({ cardId: 'card_001' } as never);
  callbacks.closed({ cardId: 'card_001', reason: 'TIMEOUT' } as never);
  callbacks.error({ code: 'UNKNOWN', message: 'unsafe raw' } as never);
  callbacks.closed({ cardId: 'card_001', reason: 'UNKNOWN' } as never);
  expect(listener.mock.calls.map(call => call[0].name)).toEqual([
    'onSecureViewOpened',
    'onValidationError',
    'onCardDataShown',
    'onSecureViewClosed',
  ]);
  expect(listener.mock.calls[1][0].payload.message).not.toContain('unsafe');
  unsubscribe();
  expect(remove).toHaveBeenCalledTimes(4);
});

test('gateway rechaza una apertura no aceptada por el módulo', async () => {
  const gateway = new NativeSecureViewGateway({
    openSecureView: jest.fn().mockResolvedValue(false),
  } as unknown as IoSecureViewSpec);

  await expect(
    gateway.openSecureView({ cardId: 'card_001', secureToken: 'opaque' }),
  ).rejects.toThrow('Vista segura no disponible');
});

test('provider proyecta el payload y rechaza formas incompletas sin cachear', async () => {
  const issueSecureToken = jest.fn().mockResolvedValue({
    value: 'opaque-demo',
    expiresAtEpochMs: 1234,
    unexpected: 'discard',
  });
  const provider = new NativeSecureTokenProvider({
    issueSecureToken,
  } as unknown as IoSecureViewSpec);
  await expect(provider.getOrRenewToken('card_001')).resolves.toEqual({
    value: 'opaque-demo',
    expiresAtEpochMs: 1234,
  });
  for (const value of [
    null,
    {},
    { value: 1, expiresAtEpochMs: 1234 },
    { value: 'opaque-demo', expiresAtEpochMs: NaN },
  ]) {
    issueSecureToken.mockResolvedValueOnce(value);
    await expect(provider.getOrRenewToken('card_001')).rejects.toThrow(
      'No se pudo emitir la autorización',
    );
  }
  expect(issueSecureToken).toHaveBeenCalledTimes(5);
});

function eventModule() {
  type Callback = (payload: never) => void;
  const listeners = new Map<string, Set<Callback>>();
  const subscribe = (name: string) => (callback: Callback) => {
    const set = listeners.get(name) ?? new Set<Callback>();
    listeners.set(name, set);
    set.add(callback);
    return { remove: jest.fn(() => set.delete(callback)) };
  };
  const module = {
    openSecureView: jest.fn().mockResolvedValue(true),
    onSecureViewOpened: subscribe('opened'),
    onValidationError: subscribe('error'),
    onCardDataShown: subscribe('shown'),
    onSecureViewClosed: subscribe('closed'),
  } as unknown as IoSecureViewSpec;
  return {
    module,
    emit(name: string, payload: unknown) {
      listeners.get(name)?.forEach(callback => callback(payload as never));
    },
    count: () =>
      [...listeners.values()].reduce((sum, set) => sum + set.size, 0),
  };
}

test('gateway proyecta los cuatro eventos con ambos códigos y motivos sin campos extra', async () => {
  const physical = eventModule();
  const gateway = new NativeSecureViewGateway(physical.module);
  const listener = jest.fn();
  const unsubscribe = gateway.subscribe(listener);
  await expect(
    gateway.openSecureView({ cardId: 'card_001', secureToken: 'opaque-demo' }),
  ).resolves.toBeUndefined();
  physical.emit('opened', { cardId: 'card_001', unexpected: 'discard' });
  physical.emit('shown', { cardId: 'card_001', unexpected: 'discard' });
  for (const code of ['TOKEN_INVALID', 'TOKEN_EXPIRED'])
    physical.emit('error', { code, message: 'discard', unexpected: 'discard' });
  for (const reason of ['USER_DISMISS', 'TIMEOUT'])
    physical.emit('closed', {
      cardId: 'card_001',
      reason,
      unexpected: 'discard',
    });
  expect(listener.mock.calls.map(([event]) => event)).toEqual([
    { name: 'onSecureViewOpened', payload: { cardId: 'card_001' } },
    { name: 'onCardDataShown', payload: { cardId: 'card_001' } },
    {
      name: 'onValidationError',
      payload: {
        code: 'TOKEN_INVALID',
        message: 'No se pudo validar el acceso. Vuelve a intentarlo.',
      },
    },
    {
      name: 'onValidationError',
      payload: {
        code: 'TOKEN_EXPIRED',
        message: 'La autorización venció. Vuelve a solicitarla.',
      },
    },
    {
      name: 'onSecureViewClosed',
      payload: { cardId: 'card_001', reason: 'USER_DISMISS' },
    },
    {
      name: 'onSecureViewClosed',
      payload: { cardId: 'card_001', reason: 'TIMEOUT' },
    },
  ]);
  unsubscribe();
  expect(physical.count()).toBe(0);
});

test('gateway descarta payloads malformados y códigos o motivos desconocidos', () => {
  const physical = eventModule();
  const listener = jest.fn();
  const unsubscribe = new NativeSecureViewGateway(physical.module).subscribe(
    listener,
  );
  for (const payload of [null, {}, { cardId: 42 }]) {
    for (const event of ['opened', 'shown', 'closed'])
      physical.emit(event, payload);
  }
  for (const payload of [
    null,
    {},
    { code: 'UNKNOWN', message: 'discard' },
    { code: 'TOKEN_INVALID', message: 42 },
  ])
    physical.emit('error', payload);
  physical.emit('closed', { cardId: 'card_001', reason: 'UNKNOWN' });
  expect(listener).not.toHaveBeenCalled();
  unsubscribe();
});

test('unsubscribe repetido retira solo sus listeners y el remount no duplica eventos', () => {
  const physical = eventModule();
  const gateway = new NativeSecureViewGateway(physical.module);
  const first = jest.fn();
  const other = jest.fn();
  const removeFirst = gateway.subscribe(first);
  const removeOther = gateway.subscribe(other);
  expect(physical.count()).toBe(8);
  removeFirst();
  removeFirst();
  expect(physical.count()).toBe(4);
  physical.emit('opened', { cardId: 'card_001' });
  expect(first).not.toHaveBeenCalled();
  expect(other).toHaveBeenCalledTimes(1);
  const remounted = jest.fn();
  const removeRemounted = gateway.subscribe(remounted);
  physical.emit('shown', { cardId: 'card_001' });
  expect(remounted).toHaveBeenCalledTimes(1);
  expect(other).toHaveBeenCalledTimes(2);
  removeOther();
  removeRemounted();
  expect(physical.count()).toBe(0);
  physical.emit('closed', { cardId: 'card_001', reason: 'TIMEOUT' });
  expect(remounted).toHaveBeenCalledTimes(1);
});
