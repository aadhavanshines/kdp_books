/**
 * Back button handling. Screens register handlers; the most recently
 * registered enabled handler runs first, and returns true when it handled
 * Back (closed a menu, moved focus up to the hero). If none does, the app's
 * root handler pops the screen stack.
 *
 * Android TV delivers the remote's Back as `hardwareBackPress`; the web build
 * maps Escape and Backspace to the same thing (see focus/webNavigator.ts).
 */
export type BackHandlerFn = () => boolean;

export interface BackRegistry {
  add(handler: BackHandlerFn): () => void;
  /** Runs handlers newest first; true if one of them handled Back. */
  dispatch(): boolean;
  size(): number;
}

export function createBackRegistry(): BackRegistry {
  let handlers: BackHandlerFn[] = [];
  return {
    add(handler) {
      handlers = [...handlers, handler];
      return () => {
        handlers = handlers.filter((h) => h !== handler);
      };
    },
    dispatch() {
      for (let i = handlers.length - 1; i >= 0; i--) {
        if (handlers[i]!()) return true;
      }
      return false;
    },
    size() {
      return handlers.length;
    },
  };
}

/** The app-wide registry. */
export const backRegistry = createBackRegistry();
