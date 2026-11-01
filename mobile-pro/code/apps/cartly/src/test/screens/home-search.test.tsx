import { fireEvent, screen, userEvent, waitFor } from '@testing-library/react-native';

import HomeScreen from '../../app/(tabs)/index';
import SearchScreen from '../../app/search';
import { buds, home, homeData, notification, summary } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import { resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => jest.requireActual('../router-mock'));

describe('Home screen', () => {
  beforeEach(resetRouter);

  function setup() {
    return fakeClient((method, path) => {
      if (path === '/cartly/home') return { body: homeData };
      if (path === '/me/addresses') return { body: [home] };
      if (path === '/notifications?app=cartly') return { body: [notification(), notification({ id: 'n2', isRead: true })] };
      if (path === '/cartly/wishlist/p-01' && method === 'PUT') return { body: summary({ isWishlisted: true }) };
      if (path === '/cartly/wishlist') return { body: [] };
      return undefined;
    });
  }

  it('shows the address, banners, deals with a countdown and top picks', async () => {
    const { client } = setup();
    await renderScreen(<HomeScreen />, client);
    expect(await screen.findByText('Deals of the day')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /Deliver to Riya Kapoor, Lake View 560101/ })).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: 'Notifications, 1 item' })).toBeOnTheScreen();
    expect(screen.getByRole('timer')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /Deal: Halcyon Audio Drift Buds.*64% off. 87% claimed/ })).toBeOnTheScreen();
    expect(screen.getByText('Almost gone: 87% claimed')).toBeOnTheScreen();
    expect(screen.getByRole('button', { name: /^Voltix, Voltix Nova 5G.*24% off. Rated 4.3/ })).toBeOnTheScreen();
  });

  it('opens a deal, a banner and wishlists a product', async () => {
    const user = userEvent.setup();
    const { client, calls } = setup();
    await renderScreen(<HomeScreen />, client);
    await user.press(await screen.findByRole('button', { name: new RegExp(`^Deal: ${buds.title}`) }));
    expect(router.push).toHaveBeenCalledWith('/product/p-07');
    // Slides render once the carousel knows its width.
    fireEvent(screen.getByTestId('banners'), 'layout', { nativeEvent: { layout: { x: 0, y: 0, width: 393, height: 200 } } });
    await user.press(await screen.findByRole('button', { name: /^The Big Bay Sale/ }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/products', params: expect.objectContaining({ minDiscount: '30' }) });
    await user.press(screen.getByTestId('wish-p-01'));
    await waitFor(() => expect(calls.some((c) => c.method === 'PUT' && c.path === '/cartly/wishlist/p-01')).toBe(true));
    expect(await screen.findByText('Saved to your wishlist')).toBeOnTheScreen();
  });
});

describe('Search screen', () => {
  beforeEach(resetRouter);

  it('suggests as you type and routes each kind', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) => {
      if (path === '/cartly/categories') return { body: homeData.categories };
      if (path.startsWith('/cartly/search/suggestions')) {
        return {
          body: [
            { text: 'vol', kind: 'query', id: null },
            { text: 'Voltix', kind: 'brand', id: null },
            { text: 'Voltix Nova 5G', kind: 'product', id: 'p-01' },
          ],
        };
      }
      return undefined;
    });
    await renderScreen(<SearchScreen />, client);
    expect(await screen.findByText('Trending in Northbay')).toBeOnTheScreen();
    await user.type(screen.getByLabelText('Search for products, brands and more'), 'vol');
    await user.press(await screen.findByRole('button', { name: 'Voltix, Brand' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/products', params: { brand: 'Voltix' } });
    await user.press(screen.getByRole('button', { name: 'Voltix Nova 5G, Product' }));
    expect(router.push).toHaveBeenCalledWith('/product/p-01');
    await user.press(screen.getByRole('button', { name: 'Fill search with Voltix Nova 5G' }));
    expect(screen.getByDisplayValue('Voltix Nova 5G')).toBeOnTheScreen();
  });

  it('searches a trending term', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) => (path === '/cartly/categories' ? { body: [] } : undefined));
    await renderScreen(<SearchScreen />, client);
    await user.press(await screen.findByRole('button', { name: 'Trending: running shoes' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/products', params: { q: 'running shoes' } });
  });
});
