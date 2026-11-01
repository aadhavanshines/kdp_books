import type { Conversation, LumoUser, StoryGroup } from './types';

/** Your own story first, then people with new stories, then the rest (stable within each band). */
export function orderStoryGroups(groups: readonly StoryGroup[]): StoryGroup[] {
  const rank = (g: StoryGroup) => (g.isMe ? 0 : g.hasUnseen ? 1 : 2);
  return groups
    .map((g, i) => ({ g, i }))
    .sort((a, b) => rank(a.g) - rank(b.g) || a.i - b.i)
    .map(({ g }) => g);
}

/** Where to start a group: its first unseen story, or the beginning when all are seen. */
export function firstUnseenIndex(group: Pick<StoryGroup, 'stories'>): number {
  const i = group.stories.findIndex((s) => !s.isSeen);
  return i < 0 ? 0 : i;
}

export interface StoryPosition {
  group: number;
  story: number;
}

/**
 * The next or previous story across groups (tap right / left in the viewer).
 * Moving into a later group starts at its first unseen story; moving back
 * lands on the previous group's last story. Null means close the viewer.
 */
export function stepStory(groups: readonly Pick<StoryGroup, 'stories'>[], at: StoryPosition, direction: 1 | -1): StoryPosition | null {
  const group = groups[at.group];
  if (!group) return null;
  const story = at.story + direction;
  if (story >= 0 && story < group.stories.length) return { group: at.group, story };
  if (direction === 1) {
    for (let g = at.group + 1; g < groups.length; g++) {
      if (groups[g]!.stories.length > 0) return { group: g, story: firstUnseenIndex(groups[g]!) };
    }
    return null;
  }
  for (let g = at.group - 1; g >= 0; g--) {
    const n = groups[g]!.stories.length;
    if (n > 0) return { group: g, story: n - 1 };
  }
  // Tapping back on the very first story restarts it.
  return { group: at.group, story: 0 };
}

/** "Tara Nair", or "Tara, Aarav and 2 others" for a group chat. */
export function conversationTitle(conversation: Pick<Conversation, 'participants'>): string {
  const people: LumoUser[] = conversation.participants;
  if (people.length === 0) return 'Just you';
  if (people.length === 1) return people[0]!.name;
  const first = (u: LumoUser) => u.name.split(' ')[0]!;
  if (people.length === 2) return `${first(people[0]!)} and ${first(people[1]!)}`;
  return `${first(people[0]!)}, ${first(people[1]!)} and ${people.length - 2} ${people.length - 2 === 1 ? 'other' : 'others'}`;
}
