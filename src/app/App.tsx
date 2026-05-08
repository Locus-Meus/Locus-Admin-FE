import { AuthSessionManager } from '@/features/auth';
import { AppRouter, QueryProvider } from './providers';

export const App = () => {
  const shouldMountAuthManager =
    typeof window === 'undefined' || window.parent === window;

  return (
    <QueryProvider>
      {shouldMountAuthManager ? <AuthSessionManager /> : null}
      <AppRouter />
    </QueryProvider>
  );
};
