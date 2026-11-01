import { act, render, screen } from '@testing-library/react-native';
import { processColor } from 'react-native';

import { createTheme } from '../theme/createTheme';
import { ThemeProvider } from '../theme/ThemeProvider';
import { CountdownTimer } from './CountdownTimer';

const NOW = new Date('2026-10-31T10:00:00.000Z').getTime();

describe('CountdownTimer', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(NOW);
  });
  afterEach(() => {
    jest.useRealTimers();
  });

  const advance = async (ms: number) => {
    await act(async () => {
      jest.advanceTimersByTime(ms);
    });
  };

  it('counts down once a second in mm:ss', async () => {
    await render(<CountdownTimer endsAt={NOW + 125_000} />);
    expect(screen.getByText('02:05')).toBeOnTheScreen();

    await advance(1000);
    expect(screen.getByText('02:04')).toBeOnTheScreen();

    await advance(64_000);
    expect(screen.getByText('01:00')).toBeOnTheScreen();
  });

  it('switches to hh:mm:ss when an hour or more is left', async () => {
    await render(<CountdownTimer endsAt={new Date(NOW + 3_723_000).toISOString()} />);
    expect(screen.getByText('01:02:03')).toBeOnTheScreen();
  });

  it('calls onComplete exactly once and shows the done label', async () => {
    const onComplete = jest.fn();
    await render(<CountdownTimer endsAt={NOW + 2000} onComplete={onComplete} doneLabel="Deal ended" />);

    await advance(2000);
    await advance(5000);

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText('Deal ended')).toBeOnTheScreen();
  });

  it('completes immediately when the end time has passed', async () => {
    const onComplete = jest.fn();
    await render(<CountdownTimer endsAt={NOW - 1000} onComplete={onComplete} />);
    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(screen.getByText('00:00')).toBeOnTheScreen();
  });

  it('restarts when endsAt changes', async () => {
    const onComplete = jest.fn();
    await render(<CountdownTimer endsAt={NOW + 1000} onComplete={onComplete} />);
    await advance(1000);
    expect(onComplete).toHaveBeenCalledTimes(1);

    await screen.rerender(<CountdownTimer endsAt={NOW + 61_000} onComplete={onComplete} />);
    expect(screen.getByText('01:00')).toBeOnTheScreen();
    await advance(60_000);
    expect(onComplete).toHaveBeenCalledTimes(2);
  });

  it('renders deal boxes and a spoken label', async () => {
    await render(<CountdownTimer endsAt={NOW + 3_723_000} variant="boxes" label="Ends in" />);
    expect(screen.getByText('01')).toBeOnTheScreen();
    expect(screen.getByText('02')).toBeOnTheScreen();
    expect(screen.getByText('03')).toBeOnTheScreen();
    expect(screen.getByRole('timer', { name: 'Ends in 1 hour 2 minutes 3 seconds' })).toBeOnTheScreen();
  });

  it('renders a ring with the time in the middle', async () => {
    await render(<CountdownTimer endsAt={NOW + 465_000} variant="ring" totalSeconds={540} label="arriving" />);
    expect(screen.getByText('07:45')).toBeOnTheScreen();
    expect(screen.getByText('arriving')).toBeOnTheScreen();
  });

  it('draws the ring in the colors it is given, for use on a brand fill', async () => {
    const { colors } = createTheme('minutely', 'light');
    await render(
      <ThemeProvider brand="minutely" scheme="light">
        <CountdownTimer endsAt={NOW + 270_000} variant="ring" totalSeconds={540} fillColor="onPrimary" trackColor="primaryPressed" color="onPrimary" testID="eta" />
      </ThemeProvider>,
    );
    const arc = screen.getByTestId('eta-arc');
    // react-native-svg hands colors to native code as packed ARGB.
    expect(arc.props.stroke.payload).toBe(processColor(colors.onPrimary));
    expect(screen.getByText('04:30')).toBeOnTheScreen();
  });

  it('keeps the brand colors by default', async () => {
    const { colors } = createTheme('minutely', 'light');
    await render(
      <ThemeProvider brand="minutely" scheme="light">
        <CountdownTimer endsAt={NOW + 270_000} variant="ring" totalSeconds={540} testID="eta" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('eta-arc').props.stroke.payload).toBe(processColor(colors.primary));
  });
});
