import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { createMemoryRouter, RouterProvider } from 'react-router';
import { setBackendForTests } from '../backend';
import { createMemoryBackend } from '../backend/memory';

/** Renders a route tree in memory with a fresh query cache and the in-memory backend. */
export function renderRoute(
  element: ReactElement,
  options: { path?: string; initialEntry?: string } = {},
) {
  const path = options.path ?? '/';
  const initialEntry = options.initialEntry ?? path;
  setBackendForTests(createMemoryBackend({ latencyMs: 0 }));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const router = createMemoryRouter([{ path, element }], { initialEntries: [initialEntry] });
  return render(
    <QueryClientProvider client={client}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );
}
