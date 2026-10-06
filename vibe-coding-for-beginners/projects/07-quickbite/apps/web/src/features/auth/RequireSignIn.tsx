import { LogIn } from 'lucide-react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { buttonClass } from '../../components/ui/buttonClass';
import { EmptyState } from '../../components/ui/EmptyState';
import { PageSpinner } from '../../components/ui/PageSpinner';
import { useSession } from './sessionStore';
import { useSignInHref } from './useSignInHref';

/** Shows `children` only to signed-in customers; everyone else gets a sign-in prompt. */
export function RequireSignIn({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  const { ready, user } = useSession();
  const href = useSignInHref();
  if (!ready) return <PageSpinner />;
  if (!user) {
    return (
      <div className="container-page">
        <EmptyState
          title={title}
          description={description}
          action={
            <Link to={href} className={buttonClass()}>
              <LogIn className="size-4" aria-hidden /> Sign in
            </Link>
          }
        />
      </div>
    );
  }
  return children;
}
