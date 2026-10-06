import { useLocation } from 'react-router';

/** Link to the sign-in page that comes back to the current page afterwards. */
export function useSignInHref() {
  const { pathname, search } = useLocation();
  return `/login?next=${encodeURIComponent(pathname + search)}`;
}
