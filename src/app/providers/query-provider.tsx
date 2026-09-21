import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query';
import type { ReactNode } from 'react';
import { handleApiError } from '@/shared/api/error-handler';

const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error) => handleApiError(error, 'query'),
  }),
  mutationCache: new MutationCache({
    onError: (error) => handleApiError(error, 'mutation'),
  }),
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
    },
  },
});

interface QueryProviderProps {
  children: ReactNode;
}

export const QueryProvider = ({ children }: QueryProviderProps) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
