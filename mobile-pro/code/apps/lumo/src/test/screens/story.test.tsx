import { act, fireEvent, screen, waitFor } from '@testing-library/react-native';

import StoryViewer, { STORY_MS } from '../../app/story/[id]';
import { group } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

beforeEach(resetRouter);

describe('Story viewer', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  const storyRoutes = () =>
    fakeClient((_m, path) => {
      if (path === '/lumo/stories') return { body: [group(), group({ user: { ...group().user, id: 'u_dev', handle: 'dev.builds', isVerified: false }, stories: [{ ...group().stories[0]!, id: 'st3', isSeen: false }] })] };
      if (path.endsWith('/seen')) return { body: null };
      return undefined;
    });

  it('plays stories in order, marks them seen, and moves to the next person', async () => {
    params.current = { id: 'u_tara' };
    const { client, calls } = storyRoutes();
    await renderScreen(<StoryViewer />, client);
    expect(await screen.findByRole('progressbar', { name: 'Story 1 of 2' })).toBeOnTheScreen();
    expect(screen.getByText('New sketch')).toBeOnTheScreen();
    await waitFor(() => expect(calls.some((c) => c.path === '/lumo/stories/st1/seen')).toBe(true));
    // Tap right: next story.
    await fireEvent.press(screen.getByRole('button', { name: 'Next story' }));
    expect(await screen.findByRole('progressbar', { name: 'Story 2 of 2' })).toBeOnTheScreen();
    // The timer advances to the next person.
    await act(async () => {
      jest.advanceTimersByTime(STORY_MS + 50);
    });
    expect(await screen.findByText('dev.builds')).toBeOnTheScreen();
    // Tap left: back to the previous person's last story.
    await fireEvent.press(screen.getByRole('button', { name: 'Previous story' }));
    expect(await screen.findByRole('progressbar', { name: 'Story 2 of 2' })).toBeOnTheScreen();
  });

  it('pauses while held and closes after the last story', async () => {
    params.current = { id: 'u_dev' };
    const { client } = storyRoutes();
    await renderScreen(<StoryViewer />, client);
    const next = await screen.findByRole('button', { name: 'Next story' });
    await fireEvent(next, 'pressIn');
    await act(async () => {
      jest.advanceTimersByTime(STORY_MS * 2);
    });
    expect(router.back).not.toHaveBeenCalled();
    await fireEvent(next, 'pressOut');
    await act(async () => {
      jest.advanceTimersByTime(STORY_MS + 50);
    });
    expect(router.back).toHaveBeenCalled();
  });
});
