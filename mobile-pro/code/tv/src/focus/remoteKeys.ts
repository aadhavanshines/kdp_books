export type RemoteKey = 'up' | 'down' | 'left' | 'right' | 'select' | 'playPause' | 'rewind' | 'fastForward';

const TV_EVENTS: Record<string, RemoteKey> = {
  up: 'up',
  down: 'down',
  left: 'left',
  right: 'right',
  select: 'select',
  playPause: 'playPause',
  rewind: 'rewind',
  fastForward: 'fastForward',
};

const KEYBOARD: Record<string, RemoteKey> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  Enter: 'select',
  ' ': 'playPause',
  MediaPlayPause: 'playPause',
  MediaRewind: 'rewind',
  MediaFastForward: 'fastForward',
};

/** react-native-tvos eventType to a remote key (null for focus/blur and other events). */
export function remoteKeyFor(eventType: string): RemoteKey | null {
  return TV_EVENTS[eventType] ?? null;
}

/** KeyboardEvent.key to a remote key. */
export function remoteKeyForKeyboard(key: string): RemoteKey | null {
  return KEYBOARD[key] ?? null;
}
