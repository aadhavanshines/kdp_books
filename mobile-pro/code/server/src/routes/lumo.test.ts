import { beforeAll, describe, expect, it } from 'vitest';
import type { Comment, Conversation, CursorPage, LumoNotification, LumoProfile, LumoUser, Message, Post, Story, StoryGroup } from '@pro/api/types';

import { createHarness, type Harness } from '../test/harness';

let h: Harness;
let token: string;
beforeAll(async () => {
  h = createHarness();
  token = await h.login();
});

describe('Lumo', () => {
  it('requires sign-in', async () => {
    expect((await h.request('GET', '/lumo/feed')).status).toBe(401);
  });

  it('pages the feed newest first without duplicates', async () => {
    const first = await h.json<CursorPage<Post>>('GET', '/lumo/feed?limit=5', { token });
    expect(first.items).toHaveLength(5);
    expect(first.nextCursor).toBeTruthy();
    const second = await h.json<CursorPage<Post>>('GET', `/lumo/feed?limit=5&cursor=${encodeURIComponent(first.nextCursor!)}`, { token });
    const ids = [...first.items, ...second.items].map((p) => p.id);
    expect(new Set(ids).size).toBe(10);
    const times = [...first.items, ...second.items].map((p) => Date.parse(p.createdAt));
    expect(times).toEqual([...times].sort((a, b) => b - a));
    expect(first.items[0]!.scene.layers.length).toBeGreaterThan(0);
  });

  it('likes and unlikes a post', async () => {
    const [post] = (await h.json<CursorPage<Post>>('GET', '/lumo/explore?limit=1', { token })).items;
    const liked = await h.json<Post>('PUT', `/lumo/posts/${post!.id}/like`, { token });
    expect(liked.isLiked).toBe(true);
    expect(liked.likeCount).toBe(post!.likeCount + (post!.isLiked ? 0 : 1));
    const again = await h.json<Post>('PUT', `/lumo/posts/${post!.id}/like`, { token });
    expect(again.likeCount).toBe(liked.likeCount);
    const unliked = await h.json<Post>('DELETE', `/lumo/posts/${post!.id}/like`, { token });
    expect(unliked.isLiked).toBe(false);
  });

  it('comments on a post and notifies the author', async () => {
    const [post] = (await h.json<CursorPage<Post>>('GET', '/lumo/explore?limit=1', { token })).items;
    const comment = await h.json<Comment>('POST', `/lumo/posts/${post!.id}/comments`, { token, body: { text: 'Love this!' }, status: 201 });
    expect(comment.author.handle).toBe('riya.kapoor');
    const comments = await h.json<Comment[]>('GET', `/lumo/posts/${post!.id}/comments`, { token });
    expect(comments.at(-1)!.text).toBe('Love this!');
  });

  it('creates a post from a scene', async () => {
    const post = await h.json<Post>('POST', '/lumo/posts', {
      token,
      body: { scene: { tone: 'sunset', layers: [{ art: 'sunflower', x: 0.5, y: 0.5, size: 0.6 }] }, filter: 'warm', caption: 'Golden hour' },
      status: 201,
    });
    expect(post.caption).toBe('Golden hour');
    const feed = await h.json<CursorPage<Post>>('GET', '/lumo/feed?limit=1', { token });
    expect(feed.items[0]!.id).toBe(post.id);
    await h.json('POST', '/lumo/posts', { token, body: { scene: { tone: 'sunset', layers: [{ art: 'not-an-art', x: 0, y: 0, size: 1 }] } }, status: 400 });
  });

  it('serves story groups with the viewer first and marks stories seen', async () => {
    const groups = await h.json<StoryGroup[]>('GET', '/lumo/stories', { token });
    expect(groups.length).toBeGreaterThan(5);
    expect(groups[0]!.isMe).toBe(true);
    const unseen = groups.find((g) => g.hasUnseen)!;
    for (const s of unseen.stories) await h.request('POST', `/lumo/stories/${s.id}/seen`, { token });
    const after = await h.json<StoryGroup[]>('GET', '/lumo/stories', { token });
    expect(after.find((g) => g.user.id === unseen.user.id)!.hasUnseen).toBe(false);
  });

  it('expires stories after 24 hours', async () => {
    const local = (await import('../test/harness')).createHarness();
    const t = await local.login();
    local.advance(25 * 60 * 60 * 1000);
    expect(await local.json<StoryGroup[]>('GET', '/lumo/stories', { token: t })).toEqual([]);
  });

  it('serves profiles, highlights, grids and follow toggles', async () => {
    const me = await h.json<LumoProfile>('GET', '/lumo/users/riya.kapoor', { token });
    expect(me.isMe).toBe(true);
    expect(me.highlights.length).toBeGreaterThan(0);
    const stories = await h.json<Story[]>('GET', `/lumo/highlights/${me.highlights[0]!.id}/stories`, { token });
    expect(stories.length).toBeGreaterThanOrEqual(2);
    const grid = await h.json<Post[]>('GET', '/lumo/users/riya.kapoor/posts?tab=grid', { token });
    expect(grid.length).toBe(me.stats.posts);

    const [someone] = await h.json<LumoUser[]>('GET', '/lumo/suggestions', { token });
    const followed = await h.json<LumoUser>('PUT', `/lumo/users/${someone!.id}/follow`, { token });
    expect(followed.isFollowing).toBe(true);
    const unfollowed = await h.json<LumoUser>('DELETE', `/lumo/users/${someone!.id}/follow`, { token });
    expect(unfollowed.isFollowing).toBe(false);
  });

  it('lists notifications', async () => {
    const notes = await h.json<LumoNotification[]>('GET', '/lumo/notifications', { token });
    expect(notes.some((n) => n.kind === 'follow')).toBe(true);
    expect(notes.some((n) => n.kind === 'like' && n.post)).toBe(true);
  });

  it('lists chats, reads them and sends messages', async () => {
    const chats = await h.json<Conversation[]>('GET', '/lumo/conversations', { token });
    expect(chats.length).toBeGreaterThanOrEqual(7);
    const unread = chats.find((c) => c.unreadCount > 0)!;
    const messages = await h.json<Message[]>('GET', `/lumo/conversations/${unread.id}/messages`, { token });
    expect(messages.length).toBeGreaterThan(3);
    const reread = await h.json<Conversation>('GET', `/lumo/conversations/${unread.id}`, { token });
    expect(reread.unreadCount).toBe(0);
    h.advance(1000);
    const sent = await h.json<Message>('POST', `/lumo/conversations/${unread.id}/messages`, { token, body: { text: 'See you at 6!' }, status: 201 });
    expect(sent.isMine).toBe(true);
    const top = (await h.json<Conversation[]>('GET', '/lumo/conversations', { token }))[0]!;
    expect(top.id).toBe(unread.id);
    expect(top.lastMessage!.text).toBe('See you at 6!');
  });

  it('reuses a DM when starting one with the same person', async () => {
    const [someone] = await h.json<LumoUser[]>('GET', '/lumo/search/users?q=a', { token });
    const a = await h.json<Conversation>('POST', '/lumo/conversations', { token, body: { userIds: [someone!.id] }, status: 201 });
    const b = await h.json<Conversation>('POST', '/lumo/conversations', { token, body: { userIds: [someone!.id] }, status: 201 });
    expect(b.id).toBe(a.id);
  });
});
