import { byIdWith, updateDeep } from './cache';

describe('updateDeep', () => {
  const data = {
    pages: [
      { items: [{ id: 'p1', likeCount: 1, author: { id: 'u1', isFollowing: false } }, { id: 'p2', likeCount: 5 }] },
      { items: [{ id: 'p3', likeCount: 2 }] },
    ],
    pageParams: [null],
  };

  it('updates matching entities at any depth', () => {
    const next = updateDeep(data, byIdWith('p2', 'likeCount'), (p) => ({ ...p, likeCount: 6 }));
    expect(next.pages[0]!.items[1]).toEqual({ id: 'p2', likeCount: 6 });
    expect(data.pages[0]!.items[1]!.likeCount).toBe(5);
  });

  it('keeps references for untouched branches', () => {
    const next = updateDeep(data, byIdWith('p3', 'likeCount'), (p) => ({ ...p, likeCount: 3 }));
    expect(next).not.toBe(data);
    expect(next.pages[0]).toBe(data.pages[0]);
    expect(next.pageParams).toBe(data.pageParams);
  });

  it('returns the same object when nothing matches', () => {
    expect(updateDeep(data, byIdWith('nope', 'likeCount'), (p) => p)).toBe(data);
  });

  it('only matches entities that have the field', () => {
    const next = updateDeep(data, byIdWith('u1', 'isFollowing'), (u) => ({ ...u, isFollowing: true }));
    expect(next.pages[0]!.items[0]!.author).toEqual({ id: 'u1', isFollowing: true });
  });
});
