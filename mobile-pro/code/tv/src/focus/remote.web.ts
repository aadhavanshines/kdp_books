/** Web: keyboard keys stand in for the remote. */
import { useEffect, useRef } from 'react';

import { remoteKeyForKeyboard, type RemoteKey } from './remoteKeys';

export type { RemoteKey };

export function useRemoteKeys(handler: (key: RemoteKey) => void, enabled = true) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    const onKey = (e: KeyboardEvent) => {
      const key = remoteKeyForKeyboard(e.key);
      if (key) ref.current(key);
    };
    // Capture phase, so the player sees the press before focus moves or a button fires.
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [enabled]);
}
