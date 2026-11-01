import { fireEvent, render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';
import { Text as RNText } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { createTheme } from '../theme/createTheme';
import { ThemeProvider } from '../theme/ThemeProvider';
import { BillDetails } from './BillDetails';
import { Carousel, slideIndexForOffset } from './Carousel';
import { CartBar } from './CartBar';
import { OptionRow } from './OptionRow';
import { OtpInput, sanitizeOtp } from './OtpInput';
import { ScreenHeader } from './ScreenHeader';
import { StarRatingInput } from './StarRatingInput';
import { TextField } from './TextField';
import { TipSelector } from './TipSelector';

const metrics = { frame: { x: 0, y: 0, width: 390, height: 844 }, insets: { top: 47, left: 0, right: 0, bottom: 34 } };

describe('CartBar', () => {
  it('shows count and total and opens the cart', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<CartBar itemCount={3} total={1249} subtitle="From Saffron Courtyard" onPress={onPress} />);

    const bar = screen.getByRole('button', { name: '3 items, ₹1,249. View cart' });
    expect(screen.getByText('From Saffron Courtyard')).toBeOnTheScreen();
    await user.press(bar);
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('uses the singular and hides when empty', async () => {
    const { rerender } = await render(<CartBar itemCount={1} total={99} onPress={() => {}} />);
    expect(screen.getByRole('button', { name: '1 item, ₹99. View cart' })).toBeOnTheScreen();
    await rerender(<CartBar itemCount={0} total={0} onPress={() => {}} />);
    expect(screen.queryByRole('button')).not.toBeOnTheScreen();
  });

  it('can fill with the primary color (Minutely) instead of the accent', async () => {
    const { colors } = createTheme('minutely', 'light');
    const bar = (tone?: 'primary') => (
      <ThemeProvider brand="minutely" scheme="light">
        <CartBar itemCount={2} total={240} onPress={() => {}} tone={tone} testID="bar" />
      </ThemeProvider>
    );
    const { rerender } = await render(bar('primary'));
    expect(screen.getByTestId('bar')).toHaveStyle({ backgroundColor: colors.primary });
    await rerender(bar());
    expect(screen.getByTestId('bar')).toHaveStyle({ backgroundColor: colors.accent });
  });
});

describe('BillDetails', () => {
  it('renders discounts, waived fees and the total', async () => {
    await render(
      <BillDetails
        savings={137}
        rows={[
          { key: 'itemTotal', label: 'Item total', amount: 500 },
          { key: 'deliveryFee', label: 'Delivery fee', amount: 0, waivedAmount: 37 },
          { key: 'couponDiscount', label: 'Coupon (WELCOME50)', amount: -100, tone: 'discount' },
          { key: 'grandTotal', label: 'To pay', amount: 431, tone: 'total' },
        ]}
      />,
    );
    expect(screen.getByText('FREE')).toBeOnTheScreen();
    expect(screen.getByText('₹37')).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(screen.getByText('-₹100')).toBeOnTheScreen();
    expect(screen.getByText('₹431')).toBeOnTheScreen();
    expect(screen.getByText('You saved ₹137 on this order')).toBeOnTheScreen();
    expect(screen.getByLabelText('Delivery fee, FREE, was ₹37')).toBeOnTheScreen();
  });
});

describe('TipSelector', () => {
  function Harness({ onChange }: { onChange: (n: number) => void }) {
    const [tip, setTip] = useState(0);
    return (
      <TipSelector
        value={tip}
        popular={30}
        onChange={(n) => {
          setTip(n);
          onChange(n);
        }}
      />
    );
  }

  it('selects a tip and clears it on a second tap', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(<Harness onChange={onChange} />);

    await user.press(screen.getByRole('radio', { name: 'Tip ₹50' }));
    expect(onChange).toHaveBeenLastCalledWith(50);
    expect(screen.getByRole('radio', { name: 'Tip ₹50' })).toBeSelected();

    await user.press(screen.getByRole('radio', { name: 'Tip ₹50' }));
    expect(onChange).toHaveBeenLastCalledWith(0);
    expect(screen.getByRole('radio', { name: 'Tip ₹30, most tipped' })).toBeOnTheScreen();
  });
});

describe('OtpInput', () => {
  it('keeps digits only, up to the length', () => {
    expect(sanitizeOtp('12a 3-45678')).toBe('123456');
    expect(sanitizeOtp('99', 4)).toBe('99');
  });

  it('fills the boxes and reports completion once', async () => {
    const onComplete = jest.fn();
    function Harness() {
      const [code, setCode] = useState('');
      return <OtpInput value={code} onChange={setCode} onComplete={onComplete} testID="otp" />;
    }
    const user = userEvent.setup();
    await render(<Harness />);

    await user.type(screen.getByTestId('otp'), '12345');
    expect(onComplete).not.toHaveBeenCalled();
    expect(screen.getByText('5')).toBeOnTheScreen();
    await user.type(screen.getByTestId('otp'), '6');
    expect(onComplete).toHaveBeenCalledWith('123456');
  });
});

describe('OptionRow', () => {
  it('works as a radio and as a checkbox', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    const { rerender } = await render(<OptionRow title="Full" trailing="+ ₹290" selected onPress={onPress} />);
    const radio = screen.getByRole('radio', { name: 'Full, + ₹290' });
    expect(radio).toBeSelected();
    await user.press(radio);
    expect(onPress).toHaveBeenCalled();

    await rerender(<OptionRow title="Extra cheese" control="checkbox" selected={false} onPress={onPress} />);
    expect(screen.getByRole('checkbox', { name: 'Extra cheese' })).not.toBeChecked();
  });
});

describe('StarRatingInput', () => {
  it('rates with a tap and shows the word', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    const { rerender } = await render(<StarRatingInput value={0} onChange={onChange} />);
    expect(screen.getByText('Tap a star to rate')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: '4 stars' }));
    expect(onChange).toHaveBeenCalledWith(4);
    await rerender(<StarRatingInput value={4} onChange={onChange} />);
    expect(screen.getByText('Good')).toBeOnTheScreen();
  });
});

describe('ScreenHeader', () => {
  it('shows a title and a working back button', async () => {
    const onBack = jest.fn();
    const user = userEvent.setup();
    await render(
      <SafeAreaProvider initialMetrics={metrics}>
        <ScreenHeader title="Cart" subtitle="Saffron Courtyard" onBack={onBack} />
      </SafeAreaProvider>,
    );
    expect(screen.getByRole('header', { name: 'Cart' })).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Go back' }));
    expect(onBack).toHaveBeenCalled();
  });
});

describe('Carousel', () => {
  it('maps a scroll offset to a slide', () => {
    expect(slideIndexForOffset(0, 300, 4)).toBe(0);
    expect(slideIndexForOffset(160, 300, 4)).toBe(1);
    expect(slideIndexForOffset(5000, 300, 4)).toBe(3);
    expect(slideIndexForOffset(100, 0, 4)).toBe(0);
  });

  it('renders slides after layout with dots', async () => {
    await render(
      <Carousel
        testID="carousel"
        data={['a', 'b', 'c']}
        keyExtractor={(s) => s}
        renderItem={(s) => <RNText>{`slide ${s}`}</RNText>}
      />,
    );
    await fireEvent(screen.getByTestId('carousel'), 'layout', { nativeEvent: { layout: { width: 390, height: 160 } } });
    expect(screen.getByText('slide b')).toBeOnTheScreen();
    expect(screen.getByLabelText('Slide 1 of 3')).toBeOnTheScreen();
  });
});

describe('TextField', () => {
  it('labels the input, shows a prefix and announces errors', async () => {
    const onChangeText = jest.fn();
    const user = userEvent.setup();
    const { rerender } = await render(<TextField label="Mobile number" prefix="+91" onChangeText={onChangeText} />);
    expect(screen.getByText('+91')).toBeOnTheScreen();
    await user.type(screen.getByLabelText('Mobile number'), '98');
    expect(onChangeText).toHaveBeenLastCalledWith('98');

    await rerender(<TextField label="Mobile number" error="Enter a 10-digit number" />);
    expect(screen.getByText('Enter a 10-digit number')).toBeOnTheScreen();
  });
});
