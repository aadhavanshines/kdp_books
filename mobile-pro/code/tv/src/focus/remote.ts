/**
 * Raw remote presses, for screens that react to keys beyond focus movement
 * (the player shows its controls on any press and scrubs with Left/Right).
 * Native: react-native-tvos's useTVEventHandler.
 */
import { useEffect, useRef } from 'react';
import { useTVEventHandler } from 'react-native';

import { remoteKeyFor, type RemoteKey } from './remoteKeys';

export type { RemoteKey };

export function useRemoteKeys(handler: (key: RemoteKey) => void, enabled = true) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useTVEventHandler((evt) => {
    if (!enabled || !evt?.eventType) return;
    // Android TV reports key down and key up; act once per press.
    if (evt.eventKeyAction !== undefined && Number(evt.eventKeyAction) === 1) return;
    const key = remoteKeyFor(evt.eventType);
    if (key) ref.current(key);
  });
}
