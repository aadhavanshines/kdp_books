import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { RouterProvider } from 'react-router/dom';
import { AuthSync } from '../features/auth/AuthSync';
import { createAppRouter } from './router';

export function App() {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { retry: 1, refetchOnWindowFocus: false },
        },
      }),
  );
  const [router] = useState(createAppRouter);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthSync />
      <RouterProvider router={router} />
    </QueryClientProvider>
  );
}
