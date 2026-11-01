import { screen, userEvent, waitFor } from '@testing-library/react-native';

import FeedScreen from '../../app/(tabs)/index';
import PostScreen from '../../app/post/[id]';
import { comment, group, me, post } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

beforeEach(resetRouter);

const feedRoutes = (extra?: (method: string, path: string, body: unknown) => { body: unknown } | undefined) =>
  fakeClient((method, path, body) => {
    const hit = extra?.(method, path, body);
    if (hit) return hit;
    if (path === '/me') return { body: me };
    if (path.startsWith('/lumo/feed')) return { body: { items: [post()], nextCursor: null } };
    if (path === '/lumo/stories') return { body: [group({ user: { ...group().user, id: 'u_me', handle: 'riya.kapoor' }, isMe: true, hasUnseen: false }), group(), group({ user: { ...group().user, id: 'u_dev', handle: 'dev.builds' }, hasUnseen: false })] };
    if (path === '/lumo/conversations') return { body: [] };
    return undefined;
  });

describe('Feed', () => {
  it('shows stories with ring states and a post with likes, caption and comments', async () => {
    const { client } = feedRoutes();
    await renderScreen(<FeedScreen />, client);
    expect(await screen.findByRole('button', { name: 'tara.sketches, new story' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'dev.builds, story' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Your story, story' })).toBeOnTheScreen();
    expect(await screen.findByText('Marine Drive')).toBeOnTheScreen();
    expect(screen.getByText('119 others')).toBeOnTheScreen();
    expect(screen.getByText('@aarav.clicks')).toBeOnTheScreen();
    expect(screen.getByText('View all 5 comments')).toBeOnTheScreen();
    await userEvent.setup().press(screen.getByRole('button', { name: 'tara.sketches, new story' }));
    expect(router.push).toHaveBeenCalledWith('/story/u_tara');
  });

  it('opens comments and posts one', async () => {
    const user = userEvent.setup();
    const { client, calls } = feedRoutes((method, path) => {
      if (path === '/lumo/posts/post_1/comments' && method === 'GET') return { body: [comment()] };
      if (path === '/lumo/posts/post_1/comments') return { body: comment({ id: 'cm2', text: 'Love this', author: { ...comment().author, handle: 'riya.kapoor' } }) };
      return undefined;
    });
    await renderScreen(<FeedScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Comment' }));
    expect(await screen.findByText('Comments')).toBeOnTheScreen();
    await user.type(screen.getByTestId('comment-input'), 'Love this');
    await user.press(screen.getByRole('button', { name: 'Post' }));
    await waitFor(() => expect(calls.find((c) => c.method === 'POST' && c.path === '/lumo/posts/post_1/comments')?.body).toEqual({ text: 'Love this' }));
    expect(await screen.findByText('View all 6 comments')).toBeOnTheScreen();
  });

  it('saves a post', async () => {
    const { client, calls } = feedRoutes((_m, path) => (path === '/lumo/posts/post_1/save' ? { body: post({ isSaved: true }) } : undefined));
    await renderScreen(<FeedScreen />, client);
    await userEvent.setup().press(await screen.findByRole('button', { name: 'Save' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'PUT' && c.path === '/lumo/posts/post_1/save')).toBe(true));
    expect(await screen.findByRole('button', { name: 'Remove from saved' })).toBeOnTheScreen();
  });
});

describe('Post', () => {
  it('shows one post by id', async () => {
    params.current = { id: 'post_1' };
    const { client } = fakeClient((_m, path) => (path === '/lumo/posts/post_1' ? { body: post() } : path === '/me' ? { body: me } : undefined));
    await renderScreen(<PostScreen />, client);
    expect(await screen.findByText('Marine Drive')).toBeOnTheScreen();
  });
});
