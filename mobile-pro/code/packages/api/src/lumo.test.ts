import { conversationTitle, firstUnseenIndex, orderStoryGroups, stepStory } from './lumo';
import type { LumoUser, Story, StoryGroup } from './types';

const user = (id: string, name = `Person ${id}`): LumoUser => ({ id, handle: id, name, avatar: null, isVerified: false, isFollowing: true });
const story = (id: string, isSeen: boolean): Story => ({ id, scene: { tone: 'sky', layers: [] }, caption: null, isSeen, createdAt: '' });
const group = (id: string, seen: boolean[], isMe = false): StoryGroup => ({
  user: user(id),
  stories: seen.map((s, i) => story(`${id}-${i}`, s)),
  hasUnseen: seen.some((s) => !s),
  isMe,
});

describe('orderStoryGroups', () => {
  it('puts you first, then unseen, then seen, keeping server order inside each band', () => {
    const ordered = orderStoryGroups([group('a', [true]), group('b', [false]), group('me', [true], true), group('c', [true]), group('d', [false, true])]);
    expect(ordered.map((g) => g.user.id)).toEqual(['me', 'b', 'd', 'a', 'c']);
  });
});

describe('firstUnseenIndex', () => {
  it('starts at the first unseen story, or the beginning', () => {
    expect(firstUnseenIndex(group('a', [true, true, false, false]))).toBe(2);
    expect(firstUnseenIndex(group('a', [true, true]))).toBe(0);
    expect(firstUnseenIndex(group('a', []))).toBe(0);
  });
});

describe('stepStory', () => {
  const groups = [group('a', [true, true]), group('empty', []), group('b', [true, false, false])];

  it('moves within a group', () => {
    expect(stepStory(groups, { group: 0, story: 0 }, 1)).toEqual({ group: 0, story: 1 });
    expect(stepStory(groups, { group: 2, story: 2 }, -1)).toEqual({ group: 2, story: 1 });
  });

  it('crosses into the next group at its first unseen story, skipping empty groups', () => {
    expect(stepStory(groups, { group: 0, story: 1 }, 1)).toEqual({ group: 2, story: 1 });
  });

  it('goes back to the end of the previous group', () => {
    expect(stepStory(groups, { group: 2, story: 0 }, -1)).toEqual({ group: 0, story: 1 });
  });

  it('closes after the last story and restarts on back from the first', () => {
    expect(stepStory(groups, { group: 2, story: 2 }, 1)).toBeNull();
    expect(stepStory(groups, { group: 0, story: 0 }, -1)).toEqual({ group: 0, story: 0 });
    expect(stepStory(groups, { group: 9, story: 0 }, 1)).toBeNull();
  });
});

describe('conversationTitle', () => {
  it('names one-to-one and group chats', () => {
    expect(conversationTitle({ participants: [user('t', 'Tara Nair')] })).toBe('Tara Nair');
    expect(conversationTitle({ participants: [user('t', 'Tara Nair'), user('a', 'Aarav Mehta')] })).toBe('Tara and Aarav');
    expect(conversationTitle({ participants: [user('t', 'Tara Nair'), user('a', 'Aarav Mehta'), user('k', 'Kabir Sethi')] })).toBe('Tara, Aarav and 1 other');
    expect(conversationTitle({ participants: [user('t', 'Tara'), user('a', 'Aarav'), user('k', 'K'), user('d', 'D')] })).toBe('Tara, Aarav and 2 others');
    expect(conversationTitle({ participants: [] })).toBe('Just you');
  });
});
