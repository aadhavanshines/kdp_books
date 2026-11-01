import type {
  ArtName,
  Comment,
  Conversation,
  CreatePostInput,
  CursorPage,
  Highlight,
  LumoNotification,
  LumoProfile,
  LumoUser,
  Message,
  PhotoFilter,
  Post,
  ProfilePostsTab,
  Scene,
  Story,
  StoryGroup,
} from '@pro/api/types';

import type { DB } from '../db';
import { badRequest, notFound } from '../lib/errors';
import { newId } from '../lib/ids';
import { parseJson } from '../lib/json';
import { DAY, iso } from '../lib/time';
import type { UserRow } from './users';

interface PostRow {
  id: string;
  user_id: string;
  scene_json: string;
  filter: string;
  caption: string;
  location: string | null;
  base_likes: number;
  created_at: number;
}

interface CommentRow {
  id: string;
  post_id: string;
  user_id: string;
  text: string;
  base_likes: number;
  created_at: number;
}

/** Builds LumoUser objects for one viewer, caching who they follow. */
export class LumoView {
  private following: Set<string>;
  private users = new Map<string, UserRow>();

  constructor(
    private db: DB,
    readonly viewerId: string,
  ) {
    this.following = new Set(
      (db.prepare('SELECT followee_id FROM follows WHERE follower_id = ?').all(viewerId) as { followee_id: string }[]).map(
        (r) => r.followee_id,
      ),
    );
  }

  isFollowing(userId: string): boolean {
    return this.following.has(userId);
  }

  row(userId: string): UserRow {
    let row = this.users.get(userId);
    if (!row) {
      row = this.db.prepare('SELECT * FROM users WHERE id = ?').get(userId) as UserRow | undefined;
      if (!row) throw notFound('User');
      this.users.set(userId, row);
    }
    return row;
  }

  user(userId: string): LumoUser {
    const r = this.row(userId);
    return {
      id: r.id,
      handle: r.handle,
      name: r.name,
      avatar: r.avatar as ArtName | null,
      isVerified: r.verified === 1,
      isFollowing: this.following.has(r.id),
    };
  }

  comment(c: CommentRow): Comment {
    const likes = this.db.prepare('SELECT COUNT(*) AS n, SUM(user_id = ?) AS mine FROM comment_likes WHERE comment_id = ?').get(
      this.viewerId,
      c.id,
    ) as { n: number; mine: number | null };
    return {
      id: c.id,
      postId: c.post_id,
      author: this.user(c.user_id),
      text: c.text,
      likeCount: c.base_likes + likes.n,
      isLiked: (likes.mine ?? 0) > 0,
      createdAt: iso(c.created_at),
    };
  }

  post(p: PostRow): Post {
    const db = this.db;
    const likeInfo = db.prepare('SELECT COUNT(*) AS n, SUM(user_id = ?) AS mine FROM likes WHERE post_id = ?').get(this.viewerId, p.id) as {
      n: number;
      mine: number | null;
    };
    const commentCount = (db.prepare('SELECT COUNT(*) AS n FROM comments WHERE post_id = ?').get(p.id) as { n: number }).n;
    const saved = db.prepare('SELECT 1 FROM saves WHERE post_id = ? AND user_id = ?').get(p.id, this.viewerId) != null;
    const likers = (
      db.prepare('SELECT user_id FROM likes WHERE post_id = ? AND user_id != ? ORDER BY created_at DESC').all(p.id, this.viewerId) as {
        user_id: string;
      }[]
    ).map((r) => r.user_id);
    const likedById = likers.find((id) => this.following.has(id)) ?? null;
    const tagged = (db.prepare('SELECT user_id FROM post_tags WHERE post_id = ?').all(p.id) as { user_id: string }[]).map((r) =>
      this.user(r.user_id),
    );
    const preview = (
      db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY base_likes DESC, created_at ASC LIMIT 2').all(p.id) as CommentRow[]
    ).map((c) => this.comment(c));
    return {
      id: p.id,
      author: this.user(p.user_id),
      scene: parseJson<Scene>(p.scene_json, { tone: 'sky', layers: [] }),
      filter: p.filter as PhotoFilter,
      caption: p.caption,
      location: p.location,
      likeCount: p.base_likes + likeInfo.n,
      commentCount,
      isLiked: (likeInfo.mine ?? 0) > 0,
      isSaved: saved,
      likedBy: likedById ? this.user(likedById) : null,
      taggedUsers: tagged,
      previewComments: preview,
      createdAt: iso(p.created_at),
    };
  }
}

function getPostRow(db: DB, id: string): PostRow {
  const row = db.prepare('SELECT * FROM posts WHERE id = ?').get(id) as PostRow | undefined;
  if (!row) throw notFound('Post');
  return row;
}

/** Cursor = "<created_at>:<id>" of the last item on the previous page. */
function decodeCursor(cursor: string | undefined): { at: number; id: string } | null {
  if (!cursor) return null;
  const [at, id] = cursor.split(':');
  const n = Number(at);
  return Number.isFinite(n) && id ? { at: n, id } : null;
}

function page(rows: PostRow[], limit: number, view: LumoView): CursorPage<Post> {
  const items = rows.slice(0, limit);
  const last = items[items.length - 1];
  return { items: items.map((p) => view.post(p)), nextCursor: rows.length > limit && last ? `${last.created_at}:${last.id}` : null };
}

/** Posts by people the viewer follows and the viewer, newest first. Everyone when following no one. */
export function feed(db: DB, viewerId: string, cursor: string | undefined, limit: number): CursorPage<Post> {
  const view = new LumoView(db, viewerId);
  const c = decodeCursor(cursor);
  const followsAnyone = (db.prepare('SELECT COUNT(*) AS n FROM follows WHERE follower_id = ?').get(viewerId) as { n: number }).n > 0;
  const where = followsAnyone
    ? '(user_id = @viewer OR user_id IN (SELECT followee_id FROM follows WHERE follower_id = @viewer))'
    : '1 = 1';
  const rows = db
    .prepare(
      `SELECT * FROM posts WHERE ${where}
       ${c ? 'AND (created_at < @at OR (created_at = @at AND id < @id))' : ''}
       ORDER BY created_at DESC, id DESC LIMIT @limit`,
    )
    .all({ viewer: viewerId, at: c?.at ?? 0, id: c?.id ?? '', limit: limit + 1 }) as PostRow[];
  return page(rows, limit, view);
}

/** Popular posts from people the viewer does not follow, then everyone else. */
export function explore(db: DB, viewerId: string, cursor: string | undefined, limit: number): CursorPage<Post> {
  const view = new LumoView(db, viewerId);
  const offset = cursor ? Math.max(0, Number(cursor) || 0) : 0;
  const rows = db
    .prepare(
      `SELECT p.* FROM posts p WHERE p.user_id != @viewer
       ORDER BY (p.user_id IN (SELECT followee_id FROM follows WHERE follower_id = @viewer)) ASC,
                (p.base_likes + (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id)) DESC, p.id
       LIMIT @limit OFFSET @offset`,
    )
    .all({ viewer: viewerId, limit: limit + 1, offset }) as PostRow[];
  const items = rows.slice(0, limit).map((p) => view.post(p));
  return { items, nextCursor: rows.length > limit ? String(offset + limit) : null };
}

export function getPost(db: DB, viewerId: string, id: string): Post {
  return new LumoView(db, viewerId).post(getPostRow(db, id));
}

export function createPost(db: DB, viewerId: string, input: CreatePostInput, now: number): Post {
  const id = newId('post');
  db.transaction(() => {
    db.prepare(
      'INSERT INTO posts (id, user_id, scene_json, filter, caption, location, base_likes, created_at) VALUES (?, ?, ?, ?, ?, ?, 0, ?)',
    ).run(id, viewerId, JSON.stringify(input.scene), input.filter, input.caption, input.location ?? null, now);
    for (const userId of new Set(input.taggedUserIds ?? [])) {
      if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId)) throw badRequest(`Unknown user ${userId}`);
      db.prepare('INSERT INTO post_tags (post_id, user_id) VALUES (?, ?)').run(id, userId);
    }
  })();
  return getPost(db, viewerId, id);
}

export function deletePost(db: DB, viewerId: string, id: string): void {
  const row = getPostRow(db, id);
  if (row.user_id !== viewerId) throw notFound('Post');
  db.prepare('DELETE FROM posts WHERE id = ?').run(id);
}

export function setLike(db: DB, viewerId: string, postId: string, liked: boolean, now: number): Post {
  const post = getPostRow(db, postId);
  if (liked) {
    const res = db.prepare('INSERT OR IGNORE INTO likes (post_id, user_id, created_at) VALUES (?, ?, ?)').run(postId, viewerId, now);
    if (res.changes > 0 && post.user_id !== viewerId) {
      db.prepare(
        "INSERT INTO lumo_notifications (id, user_id, actor_id, kind, post_id, text, created_at, read) VALUES (?, ?, ?, 'like', ?, 'liked your photo.', ?, 0)",
      ).run(newId('ln'), post.user_id, viewerId, postId, now);
    }
  } else {
    db.prepare('DELETE FROM likes WHERE post_id = ? AND user_id = ?').run(postId, viewerId);
  }
  return getPost(db, viewerId, postId);
}

export function setSaved(db: DB, viewerId: string, postId: string, saved: boolean, now: number): Post {
  getPostRow(db, postId);
  if (saved) db.prepare('INSERT OR IGNORE INTO saves (post_id, user_id, created_at) VALUES (?, ?, ?)').run(postId, viewerId, now);
  else db.prepare('DELETE FROM saves WHERE post_id = ? AND user_id = ?').run(postId, viewerId);
  return getPost(db, viewerId, postId);
}

export function listComments(db: DB, viewerId: string, postId: string): Comment[] {
  getPostRow(db, postId);
  const view = new LumoView(db, viewerId);
  return (db.prepare('SELECT * FROM comments WHERE post_id = ? ORDER BY created_at ASC').all(postId) as CommentRow[]).map((c) =>
    view.comment(c),
  );
}

export function addComment(db: DB, viewerId: string, postId: string, text: string, now: number): Comment {
  const post = getPostRow(db, postId);
  const id = newId('cm');
  db.prepare('INSERT INTO comments (id, post_id, user_id, text, base_likes, created_at) VALUES (?, ?, ?, ?, 0, ?)').run(
    id,
    postId,
    viewerId,
    text,
    now,
  );
  if (post.user_id !== viewerId) {
    db.prepare(
      "INSERT INTO lumo_notifications (id, user_id, actor_id, kind, post_id, text, created_at, read) VALUES (?, ?, ?, 'comment', ?, ?, ?, 0)",
    ).run(newId('ln'), post.user_id, viewerId, postId, `commented: ${text}`, now);
  }
  return new LumoView(db, viewerId).comment(db.prepare('SELECT * FROM comments WHERE id = ?').get(id) as CommentRow);
}

export function setCommentLike(db: DB, viewerId: string, commentId: string, liked: boolean): Comment {
  const row = db.prepare('SELECT * FROM comments WHERE id = ?').get(commentId) as CommentRow | undefined;
  if (!row) throw notFound('Comment');
  if (liked) db.prepare('INSERT OR IGNORE INTO comment_likes (comment_id, user_id) VALUES (?, ?)').run(commentId, viewerId);
  else db.prepare('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?').run(commentId, viewerId);
  return new LumoView(db, viewerId).comment(row);
}

/** Active stories (last 24 hours): the viewer first, then unseen groups, then seen. */
export function storyGroups(db: DB, viewerId: string, now: number): StoryGroup[] {
  const view = new LumoView(db, viewerId);
  const rows = db
    .prepare(
      `SELECT s.*, EXISTS(SELECT 1 FROM story_views v WHERE v.story_id = s.id AND v.user_id = @viewer) AS seen
       FROM stories s
       WHERE s.created_at > @since
         AND (s.user_id = @viewer OR s.user_id IN (SELECT followee_id FROM follows WHERE follower_id = @viewer))
       ORDER BY s.created_at ASC`,
    )
    .all({ viewer: viewerId, since: now - DAY }) as {
    id: string;
    user_id: string;
    scene_json: string;
    caption: string | null;
    created_at: number;
    seen: number;
  }[];
  const groups = new Map<string, StoryGroup>();
  for (const r of rows) {
    let g = groups.get(r.user_id);
    if (!g) {
      g = { user: view.user(r.user_id), stories: [], hasUnseen: false, isMe: r.user_id === viewerId };
      groups.set(r.user_id, g);
    }
    const story: Story = {
      id: r.id,
      scene: parseJson<Scene>(r.scene_json, { tone: 'sky', layers: [] }),
      caption: r.caption,
      isSeen: r.seen === 1,
      createdAt: iso(r.created_at),
    };
    g.stories.push(story);
    if (!story.isSeen && !g.isMe) g.hasUnseen = true;
  }
  const latest = (g: StoryGroup) => Date.parse(g.stories[g.stories.length - 1]!.createdAt);
  return [...groups.values()].sort(
    (a, b) => Number(b.isMe) - Number(a.isMe) || Number(b.hasUnseen) - Number(a.hasUnseen) || latest(b) - latest(a),
  );
}

export function markStorySeen(db: DB, viewerId: string, storyId: string): void {
  if (!db.prepare('SELECT 1 FROM stories WHERE id = ?').get(storyId)) throw notFound('Story');
  db.prepare('INSERT OR IGNORE INTO story_views (story_id, user_id) VALUES (?, ?)').run(storyId, viewerId);
}

export function getStories(db: DB, ids: string[]): Story[] {
  return ids.flatMap((id) => {
    const r = db.prepare('SELECT * FROM stories WHERE id = ?').get(id) as
      | { id: string; scene_json: string; caption: string | null; created_at: number }
      | undefined;
    return r
      ? [{ id: r.id, scene: parseJson<Scene>(r.scene_json, { tone: 'sky', layers: [] }), caption: r.caption, isSeen: true, createdAt: iso(r.created_at) }]
      : [];
  });
}

function userByHandle(db: DB, handle: string): UserRow {
  const row = db.prepare('SELECT * FROM users WHERE handle = ?').get(handle.replace(/^@/, '')) as UserRow | undefined;
  if (!row) throw notFound('Profile');
  return row;
}

export function profile(db: DB, viewerId: string, handle: string): LumoProfile {
  const row = userByHandle(db, handle);
  const view = new LumoView(db, viewerId);
  const n = (sql: string) => (db.prepare(sql).get(row.id) as { n: number }).n;
  const highlights: Highlight[] = (
    db.prepare('SELECT * FROM highlights WHERE user_id = ? ORDER BY sort').all(row.id) as {
      id: string;
      title: string;
      cover_json: string;
      story_ids_json: string;
    }[]
  ).map((h) => ({
    id: h.id,
    title: h.title,
    cover: parseJson<Scene>(h.cover_json, { tone: 'sky', layers: [] }),
    storyIds: parseJson<string[]>(h.story_ids_json, []),
  }));
  const mutualIds = (
    db
      .prepare(
        `SELECT f.follower_id FROM follows f WHERE f.followee_id = ? AND f.follower_id != ?
         AND f.follower_id IN (SELECT followee_id FROM follows WHERE follower_id = ?) LIMIT 3`,
      )
      .all(row.id, viewerId, viewerId) as { follower_id: string }[]
  ).map((r) => r.follower_id);
  // Seeded accounts show believable audience sizes on top of real follows.
  const audience = row.verified === 1 ? 18_400 : 240;
  return {
    ...view.user(row.id),
    bio: row.bio,
    website: row.website,
    stats: {
      posts: n('SELECT COUNT(*) AS n FROM posts WHERE user_id = ?'),
      followers: n('SELECT COUNT(*) AS n FROM follows WHERE followee_id = ?') + (row.phone.startsWith('90000') ? audience : 0),
      following: n('SELECT COUNT(*) AS n FROM follows WHERE follower_id = ?'),
    },
    highlights,
    isMe: row.id === viewerId,
    followsYou: db.prepare('SELECT 1 FROM follows WHERE follower_id = ? AND followee_id = ?').get(row.id, viewerId) != null,
    mutuals: mutualIds.map((id) => view.user(id)),
  };
}

export function profilePosts(db: DB, viewerId: string, handle: string, tab: ProfilePostsTab): Post[] {
  const row = userByHandle(db, handle);
  const view = new LumoView(db, viewerId);
  const sql = {
    grid: 'SELECT * FROM posts WHERE user_id = ? ORDER BY created_at DESC',
    tagged: 'SELECT p.* FROM posts p JOIN post_tags t ON t.post_id = p.id WHERE t.user_id = ? ORDER BY p.created_at DESC',
    saved: 'SELECT p.* FROM posts p JOIN saves s ON s.post_id = p.id WHERE s.user_id = ? ORDER BY s.created_at DESC',
  }[tab];
  if (tab === 'saved' && row.id !== viewerId) throw notFound('Saved posts');
  return (db.prepare(sql).all(row.id) as PostRow[]).map((p) => view.post(p));
}

export function setFollow(db: DB, viewerId: string, userId: string, follow: boolean, now: number): LumoUser {
  if (userId === viewerId) throw badRequest('You cannot follow yourself');
  if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(userId)) throw notFound('User');
  if (follow) {
    const res = db.prepare('INSERT OR IGNORE INTO follows (follower_id, followee_id, created_at) VALUES (?, ?, ?)').run(viewerId, userId, now);
    if (res.changes > 0) {
      db.prepare(
        "INSERT INTO lumo_notifications (id, user_id, actor_id, kind, post_id, text, created_at, read) VALUES (?, ?, ?, 'follow', NULL, 'started following you.', ?, 0)",
      ).run(newId('ln'), userId, viewerId, now);
    }
  } else {
    db.prepare('DELETE FROM follows WHERE follower_id = ? AND followee_id = ?').run(viewerId, userId);
  }
  return new LumoView(db, viewerId).user(userId);
}

export function searchUsers(db: DB, viewerId: string, q: string): LumoUser[] {
  const term = `%${q.trim().toLowerCase().replace(/^@/, '')}%`;
  const view = new LumoView(db, viewerId);
  return (
    db
      .prepare('SELECT id FROM users WHERE (lower(handle) LIKE ? OR lower(name) LIKE ?) AND id != ? ORDER BY verified DESC, name LIMIT 20')
      .all(term, term, viewerId) as { id: string }[]
  ).map((r) => view.user(r.id));
}

/** People to follow: popular accounts the viewer does not follow yet. */
export function suggestedUsers(db: DB, viewerId: string): LumoUser[] {
  const view = new LumoView(db, viewerId);
  return (
    db
      .prepare(
        `SELECT u.id FROM users u WHERE u.id != @viewer
         AND u.id NOT IN (SELECT followee_id FROM follows WHERE follower_id = @viewer)
         AND EXISTS (SELECT 1 FROM posts p WHERE p.user_id = u.id)
         ORDER BY u.verified DESC, (SELECT COUNT(*) FROM follows f WHERE f.followee_id = u.id) DESC LIMIT 10`,
      )
      .all({ viewer: viewerId }) as { id: string }[]
  ).map((r) => view.user(r.id));
}

export function notifications(db: DB, viewerId: string): LumoNotification[] {
  const view = new LumoView(db, viewerId);
  const rows = db
    .prepare('SELECT * FROM lumo_notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 60')
    .all(viewerId) as { id: string; actor_id: string; kind: LumoNotification['kind']; post_id: string | null; text: string; created_at: number; read: number }[];
  return rows.map((n) => {
    const post = n.post_id ? (db.prepare('SELECT id, scene_json FROM posts WHERE id = ?').get(n.post_id) as { id: string; scene_json: string } | undefined) : undefined;
    return {
      id: n.id,
      kind: n.kind,
      actor: view.user(n.actor_id),
      post: post ? { id: post.id, scene: parseJson<Scene>(post.scene_json, { tone: 'sky', layers: [] }) } : null,
      text: n.text,
      createdAt: iso(n.created_at),
      isRead: n.read === 1,
    };
  });
}

export function markNotificationsRead(db: DB, viewerId: string): void {
  db.prepare('UPDATE lumo_notifications SET read = 1 WHERE user_id = ?').run(viewerId);
}

// ---------------------------------------------------------------- direct messages

interface MessageRow {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  created_at: number;
}

const toMessage = (m: MessageRow, viewerId: string): Message => ({
  id: m.id,
  conversationId: m.conversation_id,
  senderId: m.sender_id,
  text: m.text,
  isMine: m.sender_id === viewerId,
  createdAt: iso(m.created_at),
});

function assertMember(db: DB, viewerId: string, conversationId: string): { last_read_at: number } {
  const row = db
    .prepare('SELECT last_read_at FROM conversation_members WHERE conversation_id = ? AND user_id = ?')
    .get(conversationId, viewerId) as { last_read_at: number } | undefined;
  if (!row) throw notFound('Conversation');
  return row;
}

function toConversation(db: DB, view: LumoView, id: string): Conversation {
  const member = assertMember(db, view.viewerId, id);
  const others = (
    db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ? AND user_id != ?').all(id, view.viewerId) as {
      user_id: string;
    }[]
  ).map((r) => view.user(r.user_id));
  const last = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT 1').get(id) as
    | MessageRow
    | undefined;
  const unread = (
    db
      .prepare('SELECT COUNT(*) AS n FROM messages WHERE conversation_id = ? AND sender_id != ? AND created_at > ?')
      .get(id, view.viewerId, member.last_read_at) as { n: number }
  ).n;
  const conv = db.prepare('SELECT updated_at FROM conversations WHERE id = ?').get(id) as { updated_at: number };
  return {
    id,
    participants: others,
    lastMessage: last ? toMessage(last, view.viewerId) : null,
    unreadCount: unread,
    updatedAt: iso(conv.updated_at),
  };
}

export function listConversations(db: DB, viewerId: string): Conversation[] {
  const view = new LumoView(db, viewerId);
  return (
    db
      .prepare(
        `SELECT c.id FROM conversations c JOIN conversation_members m ON m.conversation_id = c.id
         WHERE m.user_id = ? ORDER BY c.updated_at DESC`,
      )
      .all(viewerId) as { id: string }[]
  ).map((r) => toConversation(db, view, r.id));
}

export function getConversation(db: DB, viewerId: string, id: string): Conversation {
  return toConversation(db, new LumoView(db, viewerId), id);
}

/** Messages oldest first; reading them marks the chat read. */
export function listMessages(db: DB, viewerId: string, conversationId: string, now: number): Message[] {
  assertMember(db, viewerId, conversationId);
  const rows = db.prepare('SELECT * FROM messages WHERE conversation_id = ? ORDER BY created_at ASC').all(conversationId) as MessageRow[];
  db.prepare('UPDATE conversation_members SET last_read_at = ? WHERE conversation_id = ? AND user_id = ?').run(now, conversationId, viewerId);
  return rows.map((m) => toMessage(m, viewerId));
}

export function sendMessage(db: DB, viewerId: string, conversationId: string, text: string, now: number): Message {
  assertMember(db, viewerId, conversationId);
  const id = newId('msg');
  db.transaction(() => {
    db.prepare('INSERT INTO messages (id, conversation_id, sender_id, text, created_at) VALUES (?, ?, ?, ?, ?)').run(id, conversationId, viewerId, text, now);
    db.prepare('UPDATE conversations SET updated_at = ? WHERE id = ?').run(now, conversationId);
    db.prepare('UPDATE conversation_members SET last_read_at = ? WHERE conversation_id = ? AND user_id = ?').run(now, conversationId, viewerId);
  })();
  return toMessage(db.prepare('SELECT * FROM messages WHERE id = ?').get(id) as MessageRow, viewerId);
}

/** Opens (or reuses) a DM with one user. */
export function startConversation(db: DB, viewerId: string, userIds: string[], now: number): Conversation {
  const others = [...new Set(userIds.filter((id) => id !== viewerId))];
  if (others.length === 0) throw badRequest('Pick someone to message');
  for (const id of others) if (!db.prepare('SELECT 1 FROM users WHERE id = ?').get(id)) throw notFound('User');
  if (others.length === 1) {
    const existing = db
      .prepare(
        `SELECT m1.conversation_id AS id FROM conversation_members m1
         JOIN conversation_members m2 ON m2.conversation_id = m1.conversation_id
         WHERE m1.user_id = ? AND m2.user_id = ?
         AND (SELECT COUNT(*) FROM conversation_members m3 WHERE m3.conversation_id = m1.conversation_id) = 2`,
      )
      .get(viewerId, others[0]) as { id: string } | undefined;
    if (existing) return getConversation(db, viewerId, existing.id);
  }
  const id = newId('conv');
  db.transaction(() => {
    db.prepare('INSERT INTO conversations (id, updated_at) VALUES (?, ?)').run(id, now);
    for (const userId of [viewerId, ...others]) {
      db.prepare('INSERT INTO conversation_members (conversation_id, user_id, last_read_at) VALUES (?, ?, ?)').run(id, userId, now);
    }
  })();
  return getConversation(db, viewerId, id);
}
