import { Link } from 'react-router';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

function ComingSoon({ title, description }: { title: string; description: string }) {
  return (
    <div className="container-page">
      <EmptyState
        title={title}
        description={description}
        action={
          <Link to="/">
            <Button>Browse restaurants</Button>
          </Link>
        }
      />
    </div>
  );
}

export const AccountPage = () => (
  <ComingSoon
    title="Sign in is on its way"
    description="Email sign-in with a one-time link arrives with the Firebase backend (build phase 3)."
  />
);
export const OrdersPage = () => (
  <ComingSoon
    title="No orders yet"
    description="Order history and live tracking arrive with server-side orders (build phase 4)."
  />
);
export const HelpPage = () => (
  <ComingSoon
    title="Help & support"
    description="Support articles and order help will live here. For now, enjoy browsing!"
  />
);
