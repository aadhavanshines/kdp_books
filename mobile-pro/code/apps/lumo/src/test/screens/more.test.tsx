import { screen, userEvent, waitFor } from '@testing-library/react-native';

import ActivityScreen from '../../app/(tabs)/activity';
import CreateScreen from '../../app/(tabs)/create';
import ExploreScreen from '../../app/(tabs)/explore';
import ChatScreen from '../../app/chat/[id]';
import MessagesScreen from '../../app/messages';
import UserScreen from '../../app/user/[handle]';
import { conversation, group, me, message, notification, post, profile, user as person } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

beforeEach(resetRouter);

describe('Explore', () => {
  it('shows the mixed grid and searches people', async () => {
    const user = userEvent.setup();
    const posts = Array.from({ length: 7 }, (_, i) => post({ id: `p${i}`, caption: `Photo ${i}` }));
    const { client } = fakeClient((_m, path) => {
      if (path.startsWith('/lumo/explore')) return { body: { items: posts, nextCursor: null } };
      if (path === '/lumo/search/users?q=tar') return { body: [person()] };
      return undefined;
    });
    await renderScreen(<ExploreScreen />, client);
    expect(await screen.findAllByRole('button', { name: /^Post by tara.sketches: Photo \d$/ })).toHaveLength(7);
    await user.press(screen.getByRole('button', { name: 'Post by tara.sketches: Photo 0' }));
    expect(router.push).toHaveBeenCalledWith('/post/p0');
    await user.type(screen.getByLabelText('Search'), 'tar');
    await user.press(await screen.findByText('tara.sketches'));
    expect(router.push).toHaveBeenCalledWith('/user/tara.sketches');
  });
});

describe('Activity', () => {
  it('groups notifications, follows back, and marks them read when leaving', async () => {
    const user = userEvent.setup();
    const follower = person({ id: 'u_neel', handle: 'neel.stargazer', name: 'Neel', isFollowing: false });
    const { client, calls } = fakeClient((method, path) => {
      if (path === '/lumo/notifications') {
        return {
          body: [
            notification(),
            notification({ id: 'n2', kind: 'follow', actor: follower, post: null, text: 'started following you.', isRead: true, createdAt: new Date(Date.now() - 3 * 86_400_000).toISOString() }),
          ],
        };
      }
      if (path === '/lumo/users/u_neel/follow' && method === 'PUT') return { body: { ...follower, isFollowing: true } };
      if (path === '/lumo/notifications/read') return { body: null };
      return undefined;
    });
    const view = await renderScreen(<ActivityScreen />, client);
    expect(await screen.findByText('New')).toBeOnTheScreen();
    expect(screen.getByText('This week')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Follow neel.stargazer back' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'PUT' && c.path === '/lumo/users/u_neel/follow')).toBe(true));
    expect(await screen.findByRole('button', { name: 'Unfollow neel.stargazer' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /^New\. kabir.trails liked your photo/ }));
    expect(router.push).toHaveBeenCalledWith('/post/post_9');
    await view.unmount();
    expect(calls.some((c) => c.method === 'POST' && c.path === '/lumo/notifications/read')).toBe(true);
  });
});

describe('Profile', () => {
  it('shows stats, bio, highlights and switches to tagged photos', async () => {
    const user = userEvent.setup();
    params.current = { handle: 'tara.sketches' };
    const { client, calls } = fakeClient((method, path) => {
      if (path === '/lumo/users/tara.sketches') return { body: profile({ isFollowing: false }) };
      if (path === '/lumo/users/tara.sketches/posts?tab=grid') return { body: [post({ id: 'g1' })] };
      if (path === '/lumo/users/tara.sketches/posts?tab=tagged') return { body: [] };
      if (path === '/lumo/stories') return { body: [group()] };
      if (path === '/lumo/users/u_tara/follow') return { body: person() };
      if (path === '/lumo/conversations' && method === 'POST') return { body: conversation({ id: 'c9' }) };
      return undefined;
    });
    await renderScreen(<UserScreen />, client);
    expect(await screen.findByLabelText('12480 followers')).toBeOnTheScreen();
    expect(screen.getByText('12.4K')).toBeOnTheScreen();
    expect(screen.getByText('Followed by aarav.clicks')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Tara Nair, new story' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Highlight: Sketches' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/story/[id]', params: { id: 'u_tara', highlight: 'hl1', handle: 'tara.sketches', title: 'Sketches' } });
    await user.press(screen.getByRole('button', { name: 'Follow back' }));
    await waitFor(() => expect(calls.some((c) => c.method === 'PUT' && c.path === '/lumo/users/u_tara/follow')).toBe(true));
    await user.press(screen.getByRole('button', { name: 'Message' }));
    await waitFor(() => expect(router.push).toHaveBeenCalledWith('/chat/c9'));
    await user.press(screen.getByRole('tab', { name: 'Tagged' }));
    expect(await screen.findByText('No photos of you')).toBeOnTheScreen();
  });
});

describe('Create', () => {
  it('composes a photo, picks a filter, tags someone and shares', async () => {
    const user = userEvent.setup();
    const { client, calls } = fakeClient((method, path) => {
      if (path === '/lumo/stories') return { body: [group()] };
      if (path === '/lumo/posts' && method === 'POST') return { status: 201, body: post({ id: 'new' }) };
      return undefined;
    });
    await renderScreen(<CreateScreen />, client);
    // Starts with a sunset and tea; swap the tea for a camera.
    await user.press(screen.getByRole('checkbox', { name: 'hot beverage' }));
    await user.press(screen.getByRole('checkbox', { name: 'camera' }));
    expect(screen.getByRole('checkbox', { name: 'camera' })).toBeChecked();
    await user.press(screen.getByText('Backdrop'));
    await user.press(screen.getByRole('radio', { name: 'night backdrop' }));
    await user.press(screen.getByText('Filter'));
    await user.press(screen.getByRole('radio', { name: 'Mono filter' }));
    await user.press(screen.getByRole('button', { name: 'Next' }));
    await user.type(screen.getByTestId('caption-input'), 'Night shift #northbay');
    await user.press(await screen.findByRole('checkbox', { name: 'Tag tara.sketches' }));
    await user.press(screen.getByRole('button', { name: 'Share' }));
    await waitFor(() => expect(calls.some((c) => c.path === '/lumo/posts')).toBe(true));
    const body = calls.find((c) => c.path === '/lumo/posts')!.body as { scene: { tone: string; layers: { art: string }[] }; filter: string; caption: string; taggedUserIds: string[] };
    expect(body.filter).toBe('mono');
    expect(body.caption).toBe('Night shift #northbay');
    expect(body.taggedUserIds).toEqual(['u_tara']);
    expect(body.scene.tone).toBe('night');
    expect(body.scene.layers.map((l) => l.art)).toEqual(['sunset-over-buildings', 'camera']);
    await waitFor(() => expect(router.navigate).toHaveBeenCalledWith('/'));
  });
});

describe('Messages and chat', () => {
  it('lists conversations with unread state', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) => {
      if (path === '/me') return { body: me };
      if (path === '/lumo/conversations') return { body: [conversation(), conversation({ id: 'c2', participants: [person({ id: 'u_dev', name: 'Dev Malhotra' })], unreadCount: 0, lastMessage: message({ id: 'm9', isMine: true, text: 'See you' }) })] };
      return undefined;
    });
    await renderScreen(<MessagesScreen />, client);
    expect(await screen.findByRole('button', { name: /^Tara Nair, unread\./ })).toBeOnTheScreen();
    expect(screen.getByText('You: See you')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /^Dev Malhotra\./ }));
    expect(router.push).toHaveBeenCalledWith('/chat/c2');
  });

  it('shows the thread and sends a message', async () => {
    const user = userEvent.setup();
    params.current = { id: 'c1' };
    const { client, calls } = fakeClient((method, path) => {
      if (path === '/lumo/conversations/c1') return { body: conversation() };
      if (path === '/lumo/conversations/c1/messages' && method === 'GET') return { body: [message()] };
      if (path === '/lumo/conversations/c1/messages') return { body: message({ id: 'm2', text: 'Not at all!', isMine: true, senderId: 'u_riya' }) };
      if (path === '/lumo/conversations') return { body: [] };
      return undefined;
    });
    await renderScreen(<ChatScreen />, client);
    expect(await screen.findByText('Does the lighthouse sketch look too dark?')).toBeOnTheScreen();
    await user.type(screen.getByTestId('chat-input'), 'Not at all!');
    await user.press(screen.getByRole('button', { name: 'Send' }));
    expect(await screen.findByText('Not at all!')).toBeOnTheScreen();
    expect(calls.find((c) => c.method === 'POST')?.body).toEqual({ text: 'Not at all!' });
  });
});
