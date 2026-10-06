import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { setBackendForTests, type Backend, type User } from '../backend';
import { createMemoryBackend } from '../backend/memory';
import { useSession } from '../features/auth/sessionStore';

export const TEST_USER: User = { uid: 'test-user', email: 'asha@example.com' };

/**
 * Renders a route tree in memory with a fresh query cache and the in-memory
 * backend, signed in as TEST_USER unless `user` says otherwise.
 */
export function renderRoute(
  element: ReactElement,
  options: { path?: string; initialEntry?: string; user?: User | null; backend?: Backend } = {},
) {
  const user = options.user === undefined ? TEST_USER : options.user;
  const path = options.path ?? '/';
  const initialEntry = options.initialEntry ?? path;
  setBackendForTests(options.backend ?? createMemoryBackend({ latencyMs: 0, user }));
  useSession.setState({ ready: true, user });
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter([{ path, element }], { initialEntries: [initialEntry] });
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
