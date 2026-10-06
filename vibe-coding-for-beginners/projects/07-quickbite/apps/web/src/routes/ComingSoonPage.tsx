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

export const HelpPage = () => (
  <ComingSoon
    title="Help & support"
    description="Support articles and order help will live here. For now, enjoy browsing!"
  />
);
