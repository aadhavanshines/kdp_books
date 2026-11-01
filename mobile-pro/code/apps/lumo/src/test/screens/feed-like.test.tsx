// The heart burst's animation keeps running after its test, so double-tap
// liking lives in its own file (its own Jest environment).
import { fireEvent, screen, waitFor } from '@testing-library/react-native';

import FeedScreen from '../../app/(tabs)/index';
import { group, me, post } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { resetRouter } from '../router-mock';

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

describe('Feed double-tap', () => {
  it('likes on double-tap (once) and toggles with the heart', async () => {
    const { client, calls } = feedRoutes((method, path) =>
      path === '/lumo/posts/post_1/like' ? { body: post({ isLiked: method === 'PUT', likeCount: method === 'PUT' ? 121 : 120 }) } : undefined,
    );
    await renderScreen(<FeedScreen />, client);
    const photo = await screen.findByRole('button', { name: 'Photo' });
    await fireEvent.press(photo);
    await fireEvent.press(photo);
    await waitFor(() => expect(calls.filter((c) => c.path === '/lumo/posts/post_1/like' && c.method === 'PUT')).toHaveLength(1));
    expect(await screen.findByRole('button', { name: 'Unlike' })).toBeOnTheScreen();
    // A second double-tap does not unlike.
    await fireEvent.press(photo);
    await fireEvent.press(photo);
    await fireEvent.press(screen.getByRole('button', { name: 'Unlike' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/lumo/posts/post_1/like' && c.method === 'DELETE')).toBe(true));
    expect(calls.filter((c) => c.method === 'PUT' && c.path.endsWith('/like'))).toHaveLength(1);
  });

});
