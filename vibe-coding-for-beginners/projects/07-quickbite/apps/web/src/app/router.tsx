import { createBrowserRouter } from 'react-router';
import { Layout } from './layout/Layout';
import { RouteError } from './RouteError';

/** Each page is its own chunk, loaded when first visited. */
export const routes = [
  {
    element: <Layout />,
    errorElement: <RouteError />,
    children: [
      {
        index: true,
        lazy: () => import('../routes/HomePage').then((m) => ({ Component: m.HomePage })),
      },
      {
        path: 'search',
        lazy: () =>
          import('../features/cart/CartAwareRoutes').then((m) => ({ Component: m.SearchWithCart })),
      },
      {
        path: 'restaurant/:slug',
        lazy: () =>
          import('../features/cart/CartAwareRoutes').then((m) => ({
            Component: m.RestaurantWithCart,
          })),
      },
      {
        path: 'checkout',
        lazy: () => import('../routes/CheckoutPage').then((m) => ({ Component: m.CheckoutPage })),
      },
      {
        path: 'offers',
        lazy: () => import('../routes/OffersPage').then((m) => ({ Component: m.OffersPage })),
      },
      {
        path: 'login',
        lazy: () => import('../routes/LoginPage').then((m) => ({ Component: m.LoginPage })),
      },
      {
        path: 'login/finish',
        lazy: () =>
          import('../routes/LoginFinishPage').then((m) => ({ Component: m.LoginFinishPage })),
      },
      {
        path: 'account',
        lazy: () => import('../routes/AccountPage').then((m) => ({ Component: m.AccountPage })),
      },
      {
        path: 'orders',
        lazy: () => import('../routes/OrdersPage').then((m) => ({ Component: m.OrdersPage })),
      },
      {
        path: 'orders/:orderId',
        lazy: () =>
          import('../routes/OrderTrackingPage').then((m) => ({ Component: m.OrderTrackingPage })),
      },
      {
        path: 'about',
        lazy: () => import('../routes/legal/pages').then((m) => ({ Component: m.AboutPage })),
      },
      {
        path: 'contact',
        lazy: () => import('../routes/legal/pages').then((m) => ({ Component: m.ContactPage })),
      },
      {
        path: 'terms',
        lazy: () => import('../routes/legal/pages').then((m) => ({ Component: m.TermsPage })),
      },
      {
        path: 'privacy',
        lazy: () => import('../routes/legal/pages').then((m) => ({ Component: m.PrivacyPage })),
      },
      {
        path: 'refunds',
        lazy: () => import('../routes/legal/pages').then((m) => ({ Component: m.RefundsPage })),
      },
      {
        path: 'shipping',
        lazy: () => import('../routes/legal/pages').then((m) => ({ Component: m.ShippingPage })),
      },
      {
        path: 'help',
        lazy: () => import('../routes/ComingSoonPage').then((m) => ({ Component: m.HelpPage })),
      },
      {
        path: '*',
        lazy: () => import('../routes/NotFoundPage').then((m) => ({ Component: m.NotFoundPage })),
      },
    ],
  },
];

export function createAppRouter() {
  return createBrowserRouter(routes);
}
