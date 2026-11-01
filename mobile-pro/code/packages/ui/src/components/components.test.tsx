import { act, render, screen, userEvent } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ThemeProvider } from '../theme/ThemeProvider';
import type { ColorScheme } from '../tokens/colors';
import { ArtScene, ArtTile } from './Art';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import { BottomSheet } from './BottomSheet';
import { Card } from './Card';
import { Chip } from './Chip';
import { Divider } from './Divider';
import { EmptyState } from './EmptyState';
import { HeartBurst } from './HeartBurst';
import { IconButton } from './IconButton';
import { ListItem } from './ListItem';
import { MapView } from './MapView';
import { ProgressSteps } from './ProgressSteps';
import { RatingPill } from './RatingPill';
import { SearchBar } from './SearchBar';
import { SegmentedControl } from './SegmentedControl';
import { Skeleton } from './Skeleton';
import { Tabs } from './Tabs';
import { ToastProvider, useToast } from './Toast';
import { VegMark } from './VegMark';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

function Providers({ scheme, children }: { scheme: ColorScheme; children: React.ReactNode }) {
  return (
    <SafeAreaProvider initialMetrics={metrics}>
      <ThemeProvider brand="platter" scheme={scheme}>
        <ToastProvider>{children}</ToastProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

describe.each<ColorScheme>(['light', 'dark'])('every component renders (%s)', (scheme) => {
  it('renders the catalog', async () => {
    await render(
      <Providers scheme={scheme}>
        <ArtTile art="curry-and-rice" label="Biryani" shape="circle" onPress={() => undefined} />
        <ArtScene tone="sunset" layers={[{ art: 'sunflower', x: 0.5, y: 0.5, size: 0.6 }]} />
        <Avatar name="Riya Kapoor" art="woman" ring="unseen" onPress={() => undefined} />
        <Avatar name="Kabir Shah" ring="seen" />
        <Badge label="Bestseller" tone="accent" />
        <Card onPress={() => undefined} accessibilityLabel="Open Spice Route">
          <RNText>card body</RNText>
        </Card>
        <Chip label="Pure veg" selected />
        <Divider label="OR" />
        <EmptyState art="shopping-bags" title="Your cart is empty" actionLabel="Browse" onAction={() => undefined} />
        <HeartBurst trigger={1} />
        <IconButton name="cart-outline" label="Cart" badge={3} />
        <ListItem title="Addresses" leading={{ name: 'location-outline' }} onPress={() => undefined} />
        <MapView
          route={[
            { x: 200, y: 300 },
            { x: 200, y: 500 },
            { x: 500, y: 500 },
          ]}
          progress={0.4}
          markers={[{ key: 'home', point: { x: 500, y: 500 }, icon: { name: 'home' } }]}
        />
        <ProgressSteps
          current={1}
          steps={[
            { key: 'confirmed', label: 'Order confirmed', time: '7:41 pm' },
            { key: 'preparing', label: 'Preparing' },
            { key: 'delivered', label: 'Delivered' },
          ]}
        />
        <RatingPill rating={4.3} count={12400} />
        <SearchBar rotatingHints={['biryani', 'pizza']} onPress={() => undefined} />
        <SegmentedControl options={[{ key: 'grid', label: 'Grid' }, { key: 'tagged', label: 'Tagged' }]} value="grid" onChange={() => undefined} />
        <Skeleton height={20} />
        <Tabs items={[{ key: 'posts', label: 'Posts' }, { key: 'reels', label: 'Saved', count: 4 }]} value="posts" onChange={() => undefined} />
        <VegMark veg={false} />
      </Providers>,
    );

    expect(screen.getByRole('button', { name: 'Biryani' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Riya Kapoor, new story' })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Cart, 3 items' })).toBeOnTheScreen();
    expect(screen.getByRole('tab', { name: 'Posts' })).toBeSelected();
    expect(screen.getByRole('tab', { name: 'Saved, 4' })).not.toBeSelected();
    expect(screen.getByText('Your cart is empty')).toBeOnTheScreen();
    expect(screen.getByLabelText('Non-vegetarian')).toBeOnTheScreen();
    expect(screen.getByLabelText('Rated 4.3 out of 5 from 12,400 ratings')).toBeOnTheScreen();
  });
});

describe('interactive pieces', () => {
  it('BottomSheet shows its content and closes from the close button', async () => {
    const onClose = jest.fn();
    const user = userEvent.setup();
    await render(
      <Providers scheme="light">
        <BottomSheet visible onClose={onClose} title="Customise">
          <RNText>Choose a size</RNText>
        </BottomSheet>
      </Providers>,
    );
    expect(screen.getByText('Choose a size')).toBeOnTheScreen();
    await user.press(screen.getAllByRole('button', { name: 'Close' }).at(-1)!);
    expect(onClose).toHaveBeenCalled();
  });

  it('Tabs and SegmentedControl report changes', async () => {
    const onTab = jest.fn();
    const onSegment = jest.fn();
    const user = userEvent.setup();
    await render(
      <Providers scheme="light">
        <Tabs items={[{ key: 'a', label: 'Menu' }, { key: 'b', label: 'Reviews' }]} value="a" onChange={onTab} />
        <SegmentedControl options={[{ key: 'x', label: 'Delivery' }, { key: 'y', label: 'Pickup' }]} value="x" onChange={onSegment} />
      </Providers>,
    );
    await user.press(screen.getByRole('tab', { name: 'Reviews' }));
    await user.press(screen.getByRole('tab', { name: 'Pickup' }));
    expect(onTab).toHaveBeenCalledWith('b');
    expect(onSegment).toHaveBeenCalledWith('y');
  });

  it('SearchBar clears its text', async () => {
    const onChangeText = jest.fn();
    const user = userEvent.setup();
    await render(<SearchBar value="paneer" onChangeText={onChangeText} placeholder="Search dishes" />);
    await user.press(screen.getByRole('button', { name: 'Clear search' }));
    expect(onChangeText).toHaveBeenCalledWith('');
  });

  it('Toast shows a message and hides after its duration', async () => {
    jest.useFakeTimers();
    function Trigger() {
      const toast = useToast();
      return <RNText onPress={() => toast.show({ message: 'Added to cart', duration: 1000 })}>go</RNText>;
    }
    await render(
      <Providers scheme="light">
        <Trigger />
      </Providers>,
    );
    const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
    await user.press(screen.getByText('go'));
    expect(screen.getByText('Added to cart')).toBeOnTheScreen();
    await act(async () => {
      jest.advanceTimersByTime(1500);
    });
    expect(screen.queryByText('Added to cart')).not.toBeOnTheScreen();
    jest.useRealTimers();
  });
});
