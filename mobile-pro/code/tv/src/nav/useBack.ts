import { useEffect, useRef } from 'react';

import { backRegistry, type BackHandlerFn } from './back';

/** Handle Back while `enabled` (usually: while this screen is on top). Return true when handled. */
export function useBack(handler: BackHandlerFn, enabled = true) {
  const ref = useRef(handler);
  useEffect(() => {
    ref.current = handler;
  });
  useEffect(() => {
    if (!enabled) return;
    return backRegistry.add(() => ref.current());
  }, [enabled]);
}
