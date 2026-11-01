import { render, screen, userEvent } from '@testing-library/react-native';
import { useState } from 'react';

import { QuantityStepper } from './QuantityStepper';

describe('QuantityStepper', () => {
  it('starts as ADD and becomes a stepper at 1 (uncontrolled)', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(<QuantityStepper itemName="Paneer tikka" onChange={onChange} />);

    await user.press(screen.getByRole('button', { name: 'Add Paneer tikka' }));

    expect(onChange).toHaveBeenLastCalledWith(1);
    expect(screen.getByText('1')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Remove Paneer tikka' })).toBeOnTheScreen();
    expect(screen.queryByText('ADD')).not.toBeOnTheScreen();
  });

  it('increments and decrements, and returns to ADD at zero', async () => {
    const user = userEvent.setup();
    await render(<QuantityStepper itemName="Chai" defaultValue={1} />);

    await user.press(screen.getByRole('button', { name: 'Add one more Chai' }));
    await user.press(screen.getByRole('button', { name: 'Add one more Chai' }));
    expect(screen.getByText('3')).toBeOnTheScreen();

    await user.press(screen.getByRole('button', { name: 'Remove one Chai' }));
    expect(screen.getByText('2')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Remove one Chai' }));
    await user.press(screen.getByRole('button', { name: 'Remove Chai' }));

    expect(screen.getByText('ADD')).toBeOnTheScreen();
  });

  it('does not go past max and reports the limit', async () => {
    const onChange = jest.fn();
    const onLimitReached = jest.fn();
    const user = userEvent.setup();
    await render(<QuantityStepper defaultValue={2} max={2} onChange={onChange} onLimitReached={onLimitReached} />);

    await user.press(screen.getByRole('button', { name: 'Add one more' }));

    expect(onChange).not.toHaveBeenCalled();
    expect(onLimitReached).toHaveBeenCalledWith(2);
    expect(screen.getByText('2')).toBeOnTheScreen();
  });

  it('follows the value prop when controlled', async () => {
    function Controlled() {
      const [qty, setQty] = useState(0);
      return <QuantityStepper value={qty} onChange={(n) => setQty(Math.min(n, 1))} itemName="Mango" />;
    }
    const user = userEvent.setup();
    await render(<Controlled />);

    await user.press(screen.getByRole('button', { name: 'Add Mango' }));
    await user.press(screen.getByRole('button', { name: 'Add one more Mango' }));

    // The parent caps the quantity at 1.
    expect(screen.getByText('1')).toBeOnTheScreen();
  });

  it('exposes an adjustable control with the current value', async () => {
    await render(<QuantityStepper defaultValue={4} itemName="Eggs" />);
    expect(screen.getByRole('adjustable', { name: 'Quantity Eggs' })).toHaveAccessibilityValue({ now: 4 });
  });

  it('ignores presses when disabled', async () => {
    const onChange = jest.fn();
    const user = userEvent.setup();
    await render(<QuantityStepper onChange={onChange} disabled />);
    await user.press(screen.getByRole('button', { name: 'Add' }));
    expect(onChange).not.toHaveBeenCalled();
  });
});
