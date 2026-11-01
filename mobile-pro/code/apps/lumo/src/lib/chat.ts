import type { Message } from '@pro/api';
import { formatClock, shortDate } from '@pro/ui';

export type ChatItem =
  | { kind: 'day'; key: string; label: string }
  | { kind: 'message'; key: string; message: Message; first: boolean; last: boolean };

const GROUP_GAP_MS = 10 * 60 * 1000;

function dayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** "Today 4:10 pm", "Yesterday 9:02 am", or "Tue, 28 Oct 9:02 am". */
export function dayLabel(iso: string, now = Date.now()): string {
  const d = new Date(iso);
  const today = new Date(now);
  const yesterday = new Date(now - 24 * 60 * 60 * 1000);
  const day = dayKey(d) === dayKey(today) ? 'Today' : dayKey(d) === dayKey(yesterday) ? 'Yesterday' : shortDate(d);
  return `${day} ${formatClock(d)}`;
}

/**
 * Turns a thread into rows: a time separator when the day changes or after a
 * long pause, and bubbles marked first / last in a run from the same sender
 * (so only the last shows the avatar and corners can tuck in).
 */
export function chatItems(messages: readonly Message[], now = Date.now()): ChatItem[] {
  const items: ChatItem[] = [];
  messages.forEach((m, i) => {
    const prev = messages[i - 1];
    const next = messages[i + 1];
    const t = Date.parse(m.createdAt);
    const newDay = !prev || dayKey(new Date(prev.createdAt)) !== dayKey(new Date(t)) || t - Date.parse(prev.createdAt) > 60 * 60 * 1000;
    if (newDay) items.push({ kind: 'day', key: `day-${m.id}`, label: dayLabel(m.createdAt, now) });
    const joinsPrev = !!prev && !newDay && prev.senderId === m.senderId && t - Date.parse(prev.createdAt) < GROUP_GAP_MS;
    const nt = next ? Date.parse(next.createdAt) : 0;
    const nextNewDay = !next || dayKey(new Date(nt)) !== dayKey(new Date(t)) || nt - t > 60 * 60 * 1000;
    const joinsNext = !!next && !nextNewDay && next.senderId === m.senderId && nt - t < GROUP_GAP_MS;
    items.push({ kind: 'message', key: m.id, message: m, first: !joinsPrev, last: !joinsNext });
  });
  return items;
}
