import { render, screen } from '@testing-library/react-native';
import { useSharedValue } from 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '../theme/ThemeProvider';
import { PhotoScene } from './PhotoScene';
import { StoryProgress, segmentFill } from './StoryProgress';

function wrap(ui: React.ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={{ frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } }}>
      <ThemeProvider brand="lumo" scheme="light">
        {ui}
      </ThemeProvider>
    </SafeAreaProvider>,
  );
}

describe('PhotoScene', () => {
  it('is one image with a label from its art', async () => {
    await wrap(<PhotoScene seed="post_1" filter="mono" scene={{ tone: 'sunset', layers: [{ art: 'sunrise', x: 0.5, y: 0.5, size: 0.6 }, { art: 'hot-beverage', x: 0.8, y: 0.2, size: 0.2 }] }} />);
    expect(screen.getByRole('image', { name: 'Photo: Sunrise, Hot beverage' })).toBeOnTheScreen();
  });

  it('takes a custom label', async () => {
    await wrap(<PhotoScene seed="s" accessibilityLabel="Story by Riya" scene={{ tone: 'mint', layers: [] }} aspectRatio={9 / 16} />);
    expect(screen.getByRole('image', { name: 'Story by Riya' })).toBeOnTheScreen();
  });
});

describe('StoryProgress', () => {
  it('fills earlier segments, the current one partly, and none after', () => {
    expect([0, 1, 2, 3].map((i) => segmentFill(i, 2, 0.4))).toEqual([1, 1, 0.4, 0]);
    expect(segmentFill(0, 0, 1.5)).toBe(1);
    expect(segmentFill(0, 0, -1)).toBe(0);
  });

  it('announces which story is playing', async () => {
    function Harness() {
      const progress = useSharedValue(0.5);
      return <StoryProgress count={4} index={1} progress={progress} />;
    }
    await wrap(<Harness />);
    expect(screen.getByRole('progressbar', { name: 'Story 2 of 4' })).toBeOnTheScreen();
  });
});
