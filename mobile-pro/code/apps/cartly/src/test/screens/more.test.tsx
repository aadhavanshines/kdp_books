import { screen, userEvent, waitFor } from '@testing-library/react-native';

import AccountScreen from '../../app/(tabs)/account';
import CategoriesScreen from '../../app/(tabs)/categories';
import WishlistScreen from '../../app/(tabs)/wishlist';
import LoginScreen from '../../app/login';
import NotificationsScreen from '../../app/notifications';
import ReviewsScreen from '../../app/reviews/[id]';
import { cart, home, listing, notification, orderSummary, product, summary } from '../fixtures';
import { fakeClient, renderScreen } from '../render';
import type * as RouterMock from '../router-mock';
import { params, resetRouter, router } from '../router-mock';

jest.mock('expo-router', () => {
  const mock = jest.requireActual<typeof RouterMock>('../router-mock');
  return { ...mock, useLocalSearchParams: () => mock.params.current };
});

const me = { id: 'u1', name: 'Riya Kapoor', phone: '9876543210', email: 'riya@northbay.example', handle: 'riya', avatar: null, createdAt: '' };

beforeEach(resetRouter);

describe('Wishlist', () => {
  it('lists saved products and moves one to the cart', async () => {
    const user = userEvent.setup();
    const { client, calls } = fakeClient((_m, path) => {
      if (path === '/cartly/wishlist') return { body: [summary({ isWishlisted: true })] };
      if (path === '/cart/cartly') return { body: cart([]) };
      if (path === '/cart/cartly/items') return { body: cart() };
      return undefined;
    });
    await renderScreen(<WishlistScreen />, client);
    expect(await screen.findByText(/1 saved item/)).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /^Add Voltix Nova 5G.* to cart$/ }));
    await waitFor(() => expect(calls.find((c) => c.path === '/cart/cartly/items')?.body).toEqual({ productId: 'p-01', quantity: 1 }));
  });

  it('has a friendly empty state', async () => {
    const { client } = fakeClient((_m, path) => (path === '/cartly/wishlist' ? { body: [] } : path === '/cart/cartly' ? { body: cart([]) } : undefined));
    await renderScreen(<WishlistScreen />, client);
    expect(await screen.findByText('Your wishlist is empty')).toBeOnTheScreen();
  });
});

describe('Notifications', () => {
  it('opens a notification and marks everything read', async () => {
    const user = userEvent.setup();
    const { client, calls } = fakeClient((method, path) => {
      if (path === '/notifications?app=cartly') return { body: [notification(), notification({ id: 'n2', kind: 'offer', title: 'Sale is live', link: '/sale', isRead: true })] };
      if (path === '/notifications/read' && method === 'POST') return { body: null };
      return undefined;
    });
    await renderScreen(<NotificationsScreen />, client);
    expect(await screen.findByText('1 unread')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: /^Unread. Price drop on your wishlist/ }));
    expect(router.push).toHaveBeenCalledWith('/wishlist');
    expect(calls.find((c) => c.path === '/notifications/read')?.body).toEqual({ app: 'cartly', ids: ['n1'] });
    await user.press(screen.getByRole('button', { name: 'Mark all read' }));
    await waitFor(() => expect(calls.filter((c) => c.path === '/notifications/read').at(-1)?.body).toEqual({ app: 'cartly' }));
  });
});

describe('Account', () => {
  it('greets the user and links to orders', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) => {
      if (path === '/me') return { body: me };
      if (path === '/orders?app=cartly') return { body: [orderSummary()] };
      if (path === '/me/addresses') return { body: [home] };
      if (path === '/notifications?app=cartly') return { body: [notification()] };
      if (path === '/coupons?app=cartly') return { body: [] };
      return undefined;
    });
    await renderScreen(<AccountScreen />, client);
    expect(await screen.findByRole('header', { name: 'Hello, Riya' })).toBeOnTheScreen();
    expect(screen.getByText('+91 98765 43210')).toBeOnTheScreen();
    expect(await screen.findByText('1 new')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Orders' }));
    expect(router.push).toHaveBeenCalledWith('/orders');
  });
});

describe('Categories', () => {
  it('switches categories and shops by brand', async () => {
    const user = userEvent.setup();
    const { client } = fakeClient((_m, path) => {
      if (path === '/cartly/categories') {
        return { body: [{ id: 'mobiles', name: 'Mobiles', art: 'mobile-phone', tone: 'sky' }, { id: 'footwear', name: 'Footwear', art: 'athletic-shoe', tone: 'mint' }] };
      }
      if (path === '/cartly/brands?category=footwear') return { body: ['Stridewell', 'Trailmark'] };
      if (path.startsWith('/cartly/brands')) return { body: ['Voltix'] };
      if (path.startsWith('/cartly/products')) return { body: listing([summary()]) };
      return undefined;
    });
    await renderScreen(<CategoriesScreen />, client);
    expect(await screen.findByRole('button', { name: 'Voltix' })).toBeOnTheScreen();
    await user.press(screen.getByRole('tab', { name: 'Footwear' }));
    await user.press(await screen.findByRole('button', { name: 'Stridewell' }));
    expect(router.push).toHaveBeenCalledWith({ pathname: '/products', params: { category: 'footwear', brand: 'Stridewell' } });
  });
});

describe('Reviews', () => {
  it('shows the breakdown and re-sorts', async () => {
    params.current = { id: 'p-01' };
    const user = userEvent.setup();
    const p = product();
    const { client, calls } = fakeClient((_m, path) => {
      if (path === '/cartly/products/p-01') return { body: p };
      if (path.startsWith('/cartly/products/p-01/reviews')) {
        return { body: { items: p.topReviews, page: 1, pageSize: 10, total: 1, hasMore: false, summary: p.ratingSummary } };
      }
      return undefined;
    });
    await renderScreen(<ReviewsScreen />, client);
    expect(await screen.findByText('Good for the price')).toBeOnTheScreen();
    await user.press(screen.getByRole('button', { name: 'Lowest rated' }));
    await waitFor(() => expect(calls.some((c) => c.path.includes('sort=rating_low'))).toBe(true));
  });
});

describe('Login', () => {
  it('sends a code and verifies it', async () => {
    const user = userEvent.setup();
    const { client, calls } = fakeClient(
      (_m, path) => {
        if (path === '/auth/otp/request') return { body: { phone: '9876543210', expiresInSeconds: 300, devHint: 'Demo code: 123456' } };
        if (path === '/auth/otp/verify') return { body: { token: 't', user: me, isNewUser: false } };
        return undefined;
      },
      null,
    );
    await renderScreen(<LoginScreen />, client);
    expect(screen.getByText('Genuine products')).toBeOnTheScreen();
    await user.type(screen.getByTestId('phone-input'), '9876543210');
    await user.press(screen.getByRole('button', { name: 'Continue' }));
    expect(await screen.findByText('Sent to +91 98765 43210')).toBeOnTheScreen();
    await user.type(screen.getByTestId('otp-input'), '123456');
    await waitFor(() => expect(calls.find((c) => c.path === '/auth/otp/verify')?.body).toEqual({ phone: '9876543210', code: '123456' }));
  });
});
