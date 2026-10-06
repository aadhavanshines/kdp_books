import { isRouteErrorResponse, Link, useRouteError } from 'react-router';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';

export function RouteError() {
  const error = useRouteError();
  const notFound = isRouteErrorResponse(error) && error.status === 404;
  if (import.meta.env.DEV) console.error(error);
  return (
    <div className="flex min-h-dvh items-center justify-center">
      <EmptyState
        title={notFound ? 'Page not found' : 'Something went wrong'}
        description={
          notFound
            ? "We couldn't find that page."
            : 'Please try again. If it keeps happening, reload the page.'
        }
        action={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => window.location.reload()}>
              Reload
            </Button>
            <Link to="/">
              <Button>Go home</Button>
            </Link>
          </div>
        }
      />
    </div>
  );
}
