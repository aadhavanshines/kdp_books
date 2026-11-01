import { act, render, screen, waitFor } from '@testing-library/react-native';
import { useEffect } from 'react';
import { Text } from 'react-native';

import { useApi } from './hooks';
import { SessionProvider, useSession, type TokenStorage } from './session';

function memoryStorage(initial: Record<string, string> = {}): TokenStorage & { data: Record<string, string> } {
  const data = { ...initial };
  return {
    data,
    getItem: jest.fn(async (k: string) => data[k] ?? null),
    setItem: jest.fn(async (k: string, v: string) => {
      data[k] = v;
    }),
    removeItem: jest.fn(async (k: string) => {
      delete data[k];
    }),
  };
}

const probe: { api: ReturnType<typeof useApi> | null } = { api: null };
function Probe() {
  const s = useSession();
  const client = useApi();
  useEffect(() => {
    probe.api = client;
  }, [client]);
  return <Text>{`${s.ready ? 'ready' : 'loading'} ${s.signedIn ? 'in' : 'out'}`}</Text>;
}

describe('SessionProvider', () => {
  it('restores a stored token, then signs in', async () => {
    const storage = memoryStorage({ 'shop.token': 'abc' });
    await render(
      <SessionProvider storageKey="shop.token" storage={storage}>
        <Probe />
      </SessionProvider>,
    );
    expect(await screen.findByText('ready in')).toBeOnTheScreen();
    expect(probe.api?.getToken()).toBe('abc');
  });

  it('is ready and signed out with nothing stored, and saves a new token', async () => {
    const storage = memoryStorage();
    await render(
      <SessionProvider storageKey="shop.token" storage={storage}>
        <Probe />
      </SessionProvider>,
    );
    expect(await screen.findByText('ready out')).toBeOnTheScreen();
    await act(async () => probe.api?.setToken('new'));
    expect(screen.getByText('ready in')).toBeOnTheScreen();
    await waitFor(() => expect(storage.data['shop.token']).toBe('new'));
    await act(async () => probe.api?.setToken(null));
    expect(screen.getByText('ready out')).toBeOnTheScreen();
    await waitFor(() => expect(storage.data['shop.token']).toBeUndefined());
  });

  it('works without storage (memory only)', async () => {
    await render(
      <SessionProvider storageKey="shop.token">
        <Probe />
      </SessionProvider>,
    );
    expect(screen.getByText('ready out')).toBeOnTheScreen();
  });
});
