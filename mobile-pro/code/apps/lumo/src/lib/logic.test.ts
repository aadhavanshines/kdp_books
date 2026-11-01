import type { LumoNotification, Message } from '@pro/api';

import { activitySections } from './activity';
import { parseCaption, truncateCaption } from './caption';
import { chatItems } from './chat';
import { draftToInput, toggleArt } from './create';
import { exploreRows } from './explore';
import { likesLine, statCount } from './likes';

describe('caption', () => {
  it('splits mentions and hashtags, leaving a sentence-ending dot as text', () => {
    expect(parseCaption('Sunday with @tara.sketches. #northbay #golden_hour!')).toEqual([
      { kind: 'text', text: 'Sunday with ' },
      { kind: 'mention', text: '@tara.sketches' },
      { kind: 'text', text: '. ' },
      { kind: 'tag', text: '#northbay' },
      { kind: 'text', text: ' ' },
      { kind: 'tag', text: '#golden_hour' },
      { kind: 'text', text: '!' },
    ]);
    expect(parseCaption('plain')).toEqual([{ kind: 'text', text: 'plain' }]);
    expect(parseCaption('')).toEqual([]);
  });

  it('truncates long captions at a word and multi-line captions at the first line', () => {
    expect(truncateCaption('short one')).toEqual({ text: 'short one', truncated: false });
    const long = 'The mango tree I planted for my daughter is finally fruiting. She is thirty-two now. Patience is a virtue.';
    const cut = truncateCaption(long, 40);
    expect(cut.truncated).toBe(true);
    expect(cut.text).toBe('The mango tree I planted for my daughter');
    expect(truncateCaption('Line one\nLine two')).toEqual({ text: 'Line one', truncated: true });
  });
});

describe('exploreRows', () => {
  const posts = Array.from({ length: 14 }, (_, i) => ({ id: `p${i}` }));
  it('alternates feature blocks and fills leftovers', () => {
    const rows = exploreRows(posts);
    expect(rows.map((r) => r.kind)).toEqual(['feature', 'row', 'feature', 'row', 'row']);
    expect(rows[0]).toMatchObject({ side: 'left', big: { id: 'p0' }, small: [{ id: 'p1' }, { id: 'p2' }] });
    expect(rows[2]).toMatchObject({ side: 'right', big: { id: 'p6' } });
    expect(rows[4]).toMatchObject({ items: [{ id: 'p12' }, { id: 'p13' }] });
    expect(exploreRows([])).toEqual([]);
  });
});

describe('activitySections', () => {
  const now = Date.parse('2026-11-01T12:00:00Z');
  const n = (id: string, hoursAgo: number, isRead: boolean): LumoNotification => ({
    id,
    kind: 'like',
    actor: { id: 'u', handle: 'u', name: 'U', avatar: null, isVerified: false, isFollowing: false },
    post: null,
    text: 'liked your photo.',
    createdAt: new Date(now - hoursAgo * 3600_000).toISOString(),
    isRead,
  });
  it('groups unread as New, then by age, newest first, dropping empty groups', () => {
    const sections = activitySections([n('old', 300, true), n('a', 2, false), n('b', 1, false), n('week', 50, true)], now);
    expect(sections.map((s) => [s.title, s.data.map((x) => x.id)])).toEqual([
      ['New', ['b', 'a']],
      ['This week', ['week']],
      ['Earlier', ['old']],
    ]);
  });
});

describe('chatItems', () => {
  const now = Date.parse('2026-11-01T12:00:00Z');
  const m = (id: string, sender: string, minutesAgo: number): Message => ({
    id,
    conversationId: 'c',
    senderId: sender,
    text: id,
    isMine: sender === 'me',
    createdAt: new Date(now - minutesAgo * 60_000).toISOString(),
  });
  it('adds day separators and marks runs from one sender', () => {
    const items = chatItems([m('a', 'tara', 1500), m('b', 'tara', 20), m('c', 'tara', 18), m('d', 'me', 17), m('e', 'me', 2)], now);
    expect(items.map((i) => (i.kind === 'day' ? 'day' : `${i.message.id}${i.first ? 'F' : ''}${i.last ? 'L' : ''}`))).toEqual([
      'day',
      'aFL',
      'day',
      'bF',
      'cL',
      'dFL',
      'eFL',
    ]);
    const first = items[0];
    expect(first?.kind === 'day' && first.label.startsWith('Yesterday')).toBe(true);
    const second = items[2];
    expect(second?.kind === 'day' && second.label.startsWith('Today')).toBe(true);
  });
});

describe('likesLine and statCount', () => {
  const kabir = { id: 'k', handle: 'kabir.trails', name: 'Kabir', avatar: null, isVerified: false, isFollowing: true };
  it('names a friend who liked it, or counts', () => {
    expect(likesLine({ likeCount: 5407, likedBy: kabir, isLiked: false })).toEqual({ by: 'kabir.trails', rest: '5,406 others' });
    expect(likesLine({ likeCount: 2, likedBy: kabir, isLiked: true })).toEqual({ by: 'kabir.trails', rest: '1 other' });
    expect(likesLine({ likeCount: 1, likedBy: null, isLiked: true })).toEqual({ by: null, rest: '1 like' });
    expect(likesLine({ likeCount: 0, likedBy: null, isLiked: false })).toBeNull();
  });
  it('compacts big numbers without rounding up', () => {
    expect(statCount(980)).toBe('980');
    expect(statCount(9999)).toBe('9,999');
    expect(statCount(12_480)).toBe('12.4K');
    expect(statCount(120_000)).toBe('120K');
    expect(statCount(1_290_000)).toBe('1.2M');
  });
});

describe('create', () => {
  it('toggles picks up to the limit, keeping the first as hero', () => {
    expect(toggleArt([], 'camera')).toEqual(['camera']);
    expect(toggleArt(['camera', 'books'], 'camera')).toEqual(['books']);
    expect(toggleArt(['camera', 'books', 'guitar'], 'rocket')).toEqual(['camera', 'books', 'guitar']);
  });
  it('builds the create-post body', () => {
    const input = draftToInput({ picked: ['camera', 'red-heart'], tone: 'sunset', filter: 'warm', caption: '  Golden hour  ', location: ' ', tagged: [], seed: 's1' });
    expect(input).toMatchObject({ filter: 'warm', caption: 'Golden hour', location: null, taggedUserIds: undefined, scene: { tone: 'sunset' } });
    expect(input.scene.layers.map((l) => l.art)).toEqual(['camera', 'red-heart']);
  });
});
