import type { PlatterHome } from '@pro/api';
import { screen, userEvent, waitFor } from '@testing-library/react-native';

import HomeScreen from '../../app/(tabs)/index';
import { cart, dalMakhani, home as homeAddress, line, restaurant } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import { resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => jest.requireActual('../router-mock'));

const veggie = { ...restaurant, id: 'r-02', name: 'Green Leaf', isPureVeg: true, offer: null, rating: 4.2 };
const homeData: PlatterHome = {
  banners: [{ id: 'b1', app: 'platter', title: '50% OFF your first order', subtitle: 'Use WELCOME50', cta: 'Order now', art: 'curry-and-rice', tone: 'ember', link: '/offers' }],
  cuisines: [{ id: 'c1', name: 'Biryani', art: 'pot-of-food' }],
  restaurants: [restaurant, veggie],
};

function setup(cartItems = [line()]) {
  return fakeClient((_m, path) => {
    if (path === '/platter/home') return { body: homeData };
    if (path === '/me/addresses') return { body: [homeAddress] };
    if (path === '/me') return { body: { id: 'u', name: 'Riya Kapoor', phone: '9876543210', email: '', handle: '', avatar: 'woman', createdAt: '' } };
    if (path === '/cart/platter') return { body: cart(cartItems) };
    if (path.startsWith('/platter/restaurants')) return { body: path.includes('veg=true') ? [veggie] : [restaurant, veggie] };
    return undefined;
  });
}

describe('Home screen', () => {
  beforeEach(resetRouter);

  it('shows the address, cuisines and restaurant cards', async () => {
    const { client } = setup();
    await renderScreen(<HomeScreen />, client);
    expect(await screen.findByText('Saffron Courtyard')).toBeOnTheScreen();
    expect(screen.getByText('Green Leaf')).toBeOnTheScreen();
    expect(screen.getByText('12 Lake View Road', { exact: false })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Biryani' })).toBeOnTheScreen();
    expect(screen.getByText('50% OFF UP TO ₹100')).toBeOnTheScreen();
    expect(screen.getByText('2 restaurants to explore')).toBeOnTheScreen();
  });

  it('filters with chips and opens a restaurant', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<HomeScreen />, client);
    await screen.findByText('Saffron Courtyard');

    await user.press(screen.getByRole('button', { name: 'Pure veg' }));
    await waitFor(() => expect(screen.queryByText('Saffron Courtyard')).not.toBeOnTheScreen());
    expect(calls.some((c) => c.path === '/platter/restaurants?veg=true')).toBe(true);

    await user.press(screen.getByRole('button', { name: /^Green Leaf/ }));
    expect(router.push).toHaveBeenCalledWith('/restaurant/r-02');
  });

  it('shows the cart bar with the item count and opens the cart', async () => {
    const user = userEvent.setup();
    const { client } = setup([line({ quantity: 2, lineTotal: 640 })]);
    await renderScreen(<HomeScreen />, client);
    const bar = await screen.findByRole('button', { name: '2 items, ₹640. View cart' });
    await user.press(bar);
    expect(router.push).toHaveBeenCalledWith('/cart');
    expect(dalMakhani.price).toBe(320);
  });
});
