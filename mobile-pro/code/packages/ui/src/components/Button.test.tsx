import { render, screen, userEvent } from '@testing-library/react-native';

import { ThemeProvider } from '../theme/ThemeProvider';
import { Button } from './Button';

describe('Button', () => {
  it('calls onPress when pressed', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button title="Place order" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Place order' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not fire and reports disabled when disabled', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button title="Pay" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'Pay' });
    expect(button).toBeDisabled();
    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('shows a spinner, is busy and ignores presses while loading', async () => {
    const onPress = jest.fn();
    const user = userEvent.setup();
    await render(<Button title="Pay" onPress={onPress} loading />);

    const button = screen.getByRole('button', { name: 'Pay' });
    expect(button).toBeBusy();
    expect(screen.queryByText('Pay')).not.toBeOnTheScreen();
    await user.press(button);
    expect(onPress).not.toHaveBeenCalled();
  });

  it('includes trailing text in the accessible name', async () => {
    await render(<Button title="View cart" trailingText="₹1,249" />);
    expect(screen.getByRole('button', { name: 'View cart, ₹1,249' })).toBeOnTheScreen();
    expect(screen.getByText('₹1,249')).toBeOnTheScreen();
  });

  it('uses the brand primary color inside a ThemeProvider', async () => {
    await render(
      <ThemeProvider brand="cartly" scheme="light">
        <Button title="Buy now" testID="buy" />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('buy')).toHaveStyle({ backgroundColor: '#2453FF' });
  });

  it('keeps a 44pt touch target for small buttons', async () => {
    await render(<Button title="Apply" size="sm" testID="apply" />);
    expect(screen.getByTestId('apply')).toHaveProp('hitSlop', { top: 4, bottom: 4 });
  });
});
