import { render, screen } from '@testing-library/react-native';

import { Price } from './Price';

describe('Price', () => {
  it('formats rupees with Indian digit grouping', async () => {
    await render(<Price amount={124999} />);
    expect(screen.getByText('₹1,24,999')).toBeOnTheScreen();
  });

  it('shows the MRP struck through and the discount percentage', async () => {
    await render(<Price amount={249} mrp={299} />);

    expect(screen.getByText('₹249')).toBeOnTheScreen();
    const mrp = screen.getByText('₹299');
    expect(mrp).toHaveStyle({ textDecorationLine: 'line-through' });
    expect(screen.getByText('17% off')).toBeOnTheScreen();
    expect(screen.getByLabelText('Price ₹249, MRP ₹299, 17% off')).toBeOnTheScreen();
  });

  it('hides MRP and discount when MRP is not higher than the price', async () => {
    await render(<Price amount={299} mrp={299} />);
    expect(screen.queryByText(/off$/)).not.toBeOnTheScreen();
    expect(screen.getByLabelText('Price ₹299')).toBeOnTheScreen();
  });

  it('can hide the discount label but keep the MRP', async () => {
    await render(<Price amount={80} mrp={100} showDiscount={false} />);
    expect(screen.getByText('₹100')).toBeOnTheScreen();
    expect(screen.queryByText('20% off')).not.toBeOnTheScreen();
  });

  it('shows paise only for fractional amounts', async () => {
    await render(<Price amount={49.5} />);
    expect(screen.getByText('₹49.50')).toBeOnTheScreen();
  });

  it('uses tabular figures for the amount', async () => {
    await render(<Price amount={1999} />);
    expect(screen.getByText('₹1,999')).toHaveStyle({ fontVariant: ['tabular-nums'] });
  });
});
