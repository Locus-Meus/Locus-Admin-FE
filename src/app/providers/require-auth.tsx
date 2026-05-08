import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSessionStore } from '@/entities/session';
import { authenticateSilently, storeRedirectUrl } from '@/features/auth';

export const RequireAuth = () => {
  const { t } = useTranslation();
  const isAuth = useSessionStore((state) => state.isAuth);
  const isRefreshing = useSessionStore((state) => state.isRefreshing);
  const authCheckComplete = useSessionStore((state) => state.authCheckComplete);
  const location = useLocation();

  useEffect(() => {
    if (isAuth || isRefreshing || authCheckComplete) {
      return;
    }

    const redirectUrl = `${location.pathname}${location.search}${location.hash}`;
    storeRedirectUrl(redirectUrl);

    void authenticateSilently().catch(() => {
      useSessionStore.getState().setAuthCheckComplete(true);
    });
  }, [
    authCheckComplete,
    isAuth,
    isRefreshing,
    location.hash,
    location.pathname,
    location.search,
  ]);

  if (isRefreshing || (!isAuth && !authCheckComplete)) {
    return (
      <main className='flex min-h-screen items-center justify-center px-4 py-8'>
        <p className='text-sm text-muted-foreground'>{t('callback.validating')}</p>
      </main>
    );
  }

  if (!isAuth) {
    const redirectUrl = `${location.pathname}${location.search}${location.hash}`;
    storeRedirectUrl(redirectUrl);

    return <Navigate to='/' state={{ from: location }} replace />;
  }

  return <Outlet />;
};
