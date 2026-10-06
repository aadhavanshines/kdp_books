import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { renderRoute } from '../../test/render';
import { RestaurantWithCart } from './CartAwareRoutes';
import { useCart } from './cartStore';
import { ReplaceCartDialog } from './ReplaceCartDialog';

const openRestaurant = (slug: string) =>
  renderRoute(
    <>
      <RestaurantWithCart />
      <ReplaceCartDialog />
    </>,
    { path: '/restaurant/:slug', initialEntry: `/restaurant/${slug}` },
  );

describe('adding to the cart', () => {
  beforeEach(() => useCart.getState().clear());

  it('turns ADD into a stepper and updates quantities', async () => {
    openRestaurant('tandoor-tales-koramangala');
    const [add] = await screen.findAllByRole('button', { name: 'Add Butter Chicken' });
    await userEvent.click(add!);
    const more = screen.getAllByRole('button', { name: 'Add one more Butter Chicken' })[0]!;
    await userEvent.click(more);
    expect(useCart.getState().lines).toMatchObject([{ name: 'Butter Chicken', qty: 2 }]);

    await userEvent.click(screen.getAllByRole('button', { name: 'Remove one Butter Chicken' })[0]!);
    await userEvent.click(screen.getAllByRole('button', { name: 'Remove one Butter Chicken' })[0]!);
    expect(useCart.getState().lines).toEqual([]);
    expect(screen.getAllByRole('button', { name: 'Add Butter Chicken' }).length).toBeGreaterThan(0);
  });

  it('asks before replacing a cart from another restaurant', async () => {
    const view = openRestaurant('tandoor-tales-koramangala');
    await userEvent.click(
      (await screen.findAllByRole('button', { name: 'Add Butter Chicken' }))[0]!,
    );
    view.unmount();

    openRestaurant('saffron-handi-koramangala');
    await userEvent.click(
      (await screen.findAllByRole('button', { name: 'Add Butter Chicken' }))[0]!,
    );
    expect(await screen.findByRole('dialog', { name: 'Replace cart item?' })).toHaveTextContent(
      /Tandoor Tales/,
    );

    await userEvent.click(screen.getByRole('button', { name: 'No' }));
    expect(useCart.getState().restaurant?.name).toBe('Tandoor Tales');

    await userEvent.click(screen.getAllByRole('button', { name: 'Add Butter Chicken' })[0]!);
    await userEvent.click(await screen.findByRole('button', { name: 'Replace' }));
    expect(useCart.getState().restaurant?.name).toBe('Saffron Handi');
    expect(useCart.getState().lines).toHaveLength(1);
  });
});
