import { act, render, renderHook, screen, userEvent } from '@testing-library/react-native';
import { Text as RNText } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { useDebounced } from '../hooks/useDebounced';
import { AddressSheet, addressIcon } from './AddressSheet';
import { BottomBar } from './BottomBar';
import { CouponSheet, sortCoupons } from './CouponSheet';
import { ErrorState } from './ErrorState';
import { PaymentSheet } from './PaymentSheet';
import { clampProgress, ProgressBar } from './ProgressBar';
import { RatingBreakdown, ratingShares } from './RatingBreakdown';
import { SectionCard } from './SectionCard';
import { SectionHeader } from './SectionHeader';
import { Stars, starShapes } from './Stars';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

describe('ProgressBar', () => {
  it('clamps the value and reports it to screen readers', async () => {
    expect(clampProgress(1.4)).toBe(1);
    expect(clampProgress(-1)).toBe(0);
    expect(clampProgress(Number.NaN)).toBe(0);
    await render(<ProgressBar value={0.72} accessibilityLabel="72% claimed" />);
    const bar = screen.getByLabelText('72% claimed');
    expect(bar.props.accessibilityValue).toEqual({ min: 0, max: 100, now: 72 });
  });
});

describe('Stars', () => {
  it('rounds to half stars', async () => {
    expect(starShapes(4.3)).toEqual(['full', 'full', 'full', 'full', 'half']);
    expect(starShapes(4.2)).toEqual(['full', 'full', 'full', 'full', 'empty']);
    expect(starShapes(0)).toEqual(['empty', 'empty', 'empty', 'empty', 'empty']);
    expect(starShapes(9)).toEqual(['full', 'full', 'full', 'full', 'full']);
    await render(<Stars rating={4.25} />);
    expect(screen.getByLabelText('4.3 out of 5 stars')).toBeOnTheScreen();
  });
});

describe('RatingBreakdown', () => {
  const breakdown = [
    { stars: 1, count: 10 },
    { stars: 5, count: 60 },
    { stars: 4, count: 30 },
  ];

  it('computes shares from 5 down to 1, filling gaps with zero', () => {
    expect(ratingShares(breakdown)).toEqual([
      { stars: 5, count: 60, share: 0.6 },
      { stars: 4, count: 30, share: 0.3 },
      { stars: 3, count: 0, share: 0 },
      { stars: 2, count: 0, share: 0 },
      { stars: 1, count: 10, share: 0.1 },
    ]);
    expect(ratingShares([]).every((s) => s.share === 0)).toBe(true);
  });

  it('shows the average and one row per star value', async () => {
    await render(<RatingBreakdown average={4.3} count={41872} breakdown={breakdown} reviewCount={2100} />);
    expect(screen.getByLabelText('Rated 4.3 out of 5 from 41,872 ratings')).toBeOnTheScreen();
    expect(screen.getByLabelText('5 star: 60 ratings')).toBeOnTheScreen();
    expect(screen.getByLabelText('3 star: 0 ratings')).toBeOnTheScreen();
  });
});

describe('SectionHeader', () => {
  it('shows a title and a See all link', async () => {
    const onAction = jest.fn();
    const user = userEvent.setup();
    await render(<SectionHeader title="Top picks for you" subtitle="Based on your browsing" onAction={onAction} />);
    expect(screen.getByRole('header', { name: 'Top picks for you' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'See all: Top picks for you' }));
    expect(onAction).toHaveBeenCalled();
  });

  it('has no link without an action', async () => {
    await render(<SectionHeader title="Highlights" />);
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });
});

describe('BottomBar', () => {
  it('pads for the home indicator', async () => {
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <BottomBar testID="bar">
          <RNText>Buy now</RNText>
        </BottomBar>
      </SafeAreaProvider>,
    );
    expect(screen.getByTestId('bar')).toHaveStyle({ paddingBottom: 44 });
    expect(screen.getByText('Buy now')).toBeOnTheScreen();
  });
});

describe('SectionCard', () => {
  it('titles a group of content as a header, with an optional action', async () => {
    const { rerender } = await render(
      <SectionCard title="Price details" right={<RNText>Change</RNText>}>
        <RNText>Total</RNText>
      </SectionCard>,
    );
    expect(screen.getByRole('header', { name: 'Price details' })).toBeOnTheScreen();
    expect(screen.getByText('Change')).toBeOnTheScreen();
    expect(screen.getByText('Total')).toBeOnTheScreen();

    await rerender(
      <SectionCard title="Order summary" titleVariant="overline">
        <RNText>Items</RNText>
      </SectionCard>,
    );
    expect(screen.getByRole('header', { name: 'Order summary' })).toBeOnTheScreen();

    await rerender(
      <SectionCard>
        <RNText>Untitled</RNText>
      </SectionCard>,
    );
    expect(screen.queryByRole('header')).toBeNull();
  });
});

describe('ErrorState', () => {
  it('explains offline, not found and general errors', async () => {
    const retry = jest.fn();
    const user = userEvent.setup();
    const { rerender } = await render(<ErrorState error={{ isNetworkError: true, status: 0, message: 'x' }} onRetry={retry} />);
    expect(screen.getByText('You seem to be offline')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Try again' }));
    expect(retry).toHaveBeenCalled();

    await rerender(<ErrorState error={{ status: 404, message: 'Product not found' }} onRetry={retry} />);
    expect(screen.getByText('We could not find that')).toBeOnTheScreen();

    await rerender(<ErrorState error={new Error('Server error')} onRetry={retry} />);
    expect(screen.getByText('Something went wrong')).toBeOnTheScreen();
    expect(screen.getByText('Server error')).toBeOnTheScreen();
  });
});

describe('AddressSheet', () => {
  const addresses = [
    { id: 'a1', label: 'Home', line1: 'Flat 3B', line2: '12 Lake View Road', locality: 'Lakeside', pincode: '560102' },
    { id: 'a2', label: 'Work', line1: 'Floor 5, Bay Tower', line2: '', locality: 'Harbour', pincode: '560105' },
  ];

  it('lists addresses with pincodes and picks one', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <AddressSheet visible onClose={() => {}} addresses={addresses} selectedId="a1" onSelect={onSelect} showPincode />
      </SafeAreaProvider>,
    );
    expect(screen.getByRole('radio', { name: 'Home, Flat 3B, 12 Lake View Road, Lakeside, 560102' })).toBeSelected();
    await user.press(screen.getByRole('radio', { name: /^Work/ }));
    expect(onSelect).toHaveBeenCalledWith(addresses[1]);
  });

  it('picks an icon from the label', () => {
    expect(addressIcon('Home')).toEqual({ name: 'home' });
    expect(addressIcon('work')).toEqual({ name: 'briefcase' });
    expect(addressIcon("Mom's place")).toEqual({ name: 'location' });
  });
});

describe('PaymentSheet', () => {
  it('lists options with offers and blocks disabled ones', async () => {
    const onSelect = jest.fn();
    const user = userEvent.setup();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <PaymentSheet
          visible
          onClose={() => {}}
          selectedId="upi"
          onSelect={onSelect}
          options={[
            { id: 'upi', title: 'UPI', subtitle: 'riya@okaxis.example', icon: { name: 'phone-portrait-outline' }, offer: 'Flat ₹25 cashback' },
            { id: 'cod', title: 'Pay on delivery', subtitle: 'Not available for this pincode', icon: { name: 'cash-outline' }, disabled: true },
          ]}
        />
      </SafeAreaProvider>,
    );
    expect(screen.getByText('Flat ₹25 cashback')).toBeOnTheScreen();
    await user.press(screen.getByRole('radio', { name: /^Pay on delivery/ }));
    expect(onSelect).not.toHaveBeenCalled();
    await user.press(screen.getByRole('radio', { name: /^UPI/ }));
    expect(onSelect).toHaveBeenCalledWith('upi');
  });
});

describe('useDebounced', () => {
  it('updates only after the value settles', async () => {
    jest.useFakeTimers();
    const { result, rerender } = await renderHook(({ v }: { v: string }) => useDebounced(v, 200), { initialProps: { v: 'a' } });
    await rerender({ v: 'ab' });
    expect(result.current).toBe('a');
    await act(async () => {
      jest.advanceTimersByTime(250);
    });
    expect(result.current).toBe('ab');
    jest.useRealTimers();
  });
});

describe('CouponSheet', () => {
  const base = { title: 'Deal', description: 'Details', kind: 'percent' as const, value: 10, reason: null };
  const coupons = [
    { ...base, code: 'LOW', applicable: true, estimatedSavings: 50 },
    { ...base, code: 'LOCKED', applicable: false, estimatedSavings: 0, reason: 'Add ₹120 more to apply' },
    { ...base, code: 'BEST', applicable: true, estimatedSavings: 500 },
  ];

  it('puts applicable coupons first, best savings first', () => {
    expect(sortCoupons(coupons).map((c) => c.code)).toEqual(['BEST', 'LOW', 'LOCKED']);
  });

  it('applies a coupon and explains locked ones', async () => {
    const onApply = jest.fn();
    const user = userEvent.setup();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <CouponSheet visible coupons={coupons} onClose={() => {}} appliedCode="LOW" onApply={onApply} />
      </SafeAreaProvider>,
    );
    expect(screen.getByText('Add ₹120 more to apply')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Apply LOCKED' })).toBeDisabled();
    expect(screen.getByText('Applied')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Apply BEST' }));
    expect(onApply).toHaveBeenCalledWith('BEST');
  });
});
