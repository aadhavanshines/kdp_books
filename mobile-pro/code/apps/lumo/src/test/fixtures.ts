import type { Comment, Conversation, LumoNotification, LumoProfile, LumoUser, Message, Post, StoryGroup } from '@pro/api';

export const me = { id: 'u_riya', name: 'Riya Kapoor', phone: '9876543210', email: 'riya@northbay.example', handle: 'riya.kapoor', avatar: 'woman' as const, createdAt: '' };

export const user = (over: Partial<LumoUser> = {}): LumoUser => ({
  id: 'u_tara',
  handle: 'tara.sketches',
  name: 'Tara Nair',
  avatar: 'artist',
  isVerified: true,
  isFollowing: true,
  ...over,
});

const ago = (minutes: number) => new Date(Date.now() - minutes * 60_000).toISOString();

export const comment = (over: Partial<Comment> = {}): Comment => ({
  id: 'cm1',
  postId: 'post_1',
  author: user({ id: 'u_kabir', handle: 'kabir.trails', name: 'Kabir Sethi', avatar: 'man', isVerified: false }),
  text: 'Golden hour hits different',
  likeCount: 4,
  isLiked: false,
  createdAt: ago(30),
  ...over,
});

export const post = (over: Partial<Post> = {}): Post => ({
  id: 'post_1',
  author: user(),
  scene: { tone: 'sunset', layers: [{ art: 'sunset-over-buildings', x: 0.5, y: 0.55, size: 0.7 }] },
  filter: 'normal',
  caption: 'Evening walk with @aarav.clicks #northbay',
  location: 'Marine Drive',
  likeCount: 120,
  commentCount: 5,
  isLiked: false,
  isSaved: false,
  likedBy: user({ id: 'u_kabir', handle: 'kabir.trails', name: 'Kabir Sethi', avatar: 'man', isVerified: false }),
  taggedUsers: [],
  previewComments: [comment()],
  createdAt: ago(120),
  ...over,
});

export const group = (over: Partial<StoryGroup> = {}): StoryGroup => ({
  user: user(),
  stories: [
    { id: 'st1', scene: { tone: 'lilac', layers: [{ art: 'artist-palette', x: 0.5, y: 0.5, size: 0.6 }] }, caption: 'New sketch', isSeen: false, createdAt: ago(60) },
    { id: 'st2', scene: { tone: 'sky', layers: [{ art: 'books', x: 0.5, y: 0.5, size: 0.6 }] }, caption: null, isSeen: false, createdAt: ago(30) },
  ],
  hasUnseen: true,
  isMe: false,
  ...over,
});

export const profile = (over: Partial<LumoProfile> = {}): LumoProfile => ({
  ...user(),
  bio: 'Illustrator drawing Northbay 🎨',
  website: 'tarasketches.example',
  stats: { posts: 24, followers: 12_480, following: 310 },
  highlights: [{ id: 'hl1', title: 'Sketches', cover: { tone: 'lilac', layers: [{ art: 'artist-palette', x: 0.5, y: 0.5, size: 0.6 }] }, storyIds: ['st1'] }],
  isMe: false,
  followsYou: true,
  mutuals: [user({ id: 'u_aarav', handle: 'aarav.clicks', name: 'Aarav Mehta' })],
  ...over,
});

export const notification = (over: Partial<LumoNotification> = {}): LumoNotification => ({
  id: 'n1',
  kind: 'like',
  actor: user({ id: 'u_kabir', handle: 'kabir.trails', name: 'Kabir Sethi', avatar: 'man' }),
  post: { id: 'post_9', scene: { tone: 'mint', layers: [{ art: 'potted-plant', x: 0.5, y: 0.5, size: 0.6 }] } },
  text: 'liked your photo.',
  createdAt: ago(10),
  isRead: false,
  ...over,
});

export const message = (over: Partial<Message> = {}): Message => ({
  id: 'm1',
  conversationId: 'c1',
  senderId: 'u_tara',
  text: 'Does the lighthouse sketch look too dark?',
  isMine: false,
  createdAt: ago(20),
  ...over,
});

export const conversation = (over: Partial<Conversation> = {}): Conversation => ({
  id: 'c1',
  participants: [user()],
  lastMessage: message(),
  unreadCount: 1,
  updatedAt: ago(20),
  ...over,
});
