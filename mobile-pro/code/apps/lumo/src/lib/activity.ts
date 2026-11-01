import type { LumoNotification } from '@pro/api';

export interface ActivitySection {
  title: 'New' | 'Today' | 'This week' | 'Earlier';
  data: LumoNotification[];
}

const DAY = 24 * 60 * 60 * 1000;

/** Unread first as "New", then Today, This week and Earlier; empty sections are dropped. */
export function activitySections(list: readonly LumoNotification[], now = Date.now()): ActivitySection[] {
  const sections: ActivitySection[] = [
    { title: 'New', data: [] },
    { title: 'Today', data: [] },
    { title: 'This week', data: [] },
    { title: 'Earlier', data: [] },
  ];
  const sorted = [...list].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt));
  for (const n of sorted) {
    const age = now - Date.parse(n.createdAt);
    const index = !n.isRead ? 0 : age < DAY ? 1 : age < 7 * DAY ? 2 : 3;
    sections[index]!.data.push(n);
  }
  return sections.filter((s) => s.data.length > 0);
}

