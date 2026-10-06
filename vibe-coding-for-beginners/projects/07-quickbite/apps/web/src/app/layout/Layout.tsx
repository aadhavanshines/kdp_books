import { Suspense } from 'react';
import { Outlet, ScrollRestoration, useLocation } from 'react-router';
import { PageSpinner } from '../../components/ui/PageSpinner';
import { CartBar } from '../../features/cart/CartBar';
import { ReplaceCartDialog } from '../../features/cart/ReplaceCartDialog';
import { DemoBanner } from '../../features/payments/DemoBanner';
import { Footer } from './Footer';
import { Header } from './Header';

export function Layout() {
  // Checkout is a focused flow: no footer links to wander off to.
  const focused = useLocation().pathname.startsWith('/checkout');
  return (
    <div className="flex min-h-dvh flex-col">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-white px-4 py-2 font-bold focus:not-sr-only focus:fixed focus:top-2 focus:left-2"
      >
        Skip to content
      </a>
      <DemoBanner />
      <Header />
      <main id="main" className="flex-1">
        <Suspense fallback={<PageSpinner />}>
          <Outlet />
        </Suspense>
      </main>
      {!focused && <Footer />}
      <CartBar />
      <ReplaceCartDialog />
      <ScrollRestoration />
    </div>
  );
}
