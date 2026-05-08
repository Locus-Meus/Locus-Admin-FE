import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { Button, LanguageSwitcher } from '@/shared/ui';
import {
  clearStoredRedirectUrl,
  completePkceFlow,
  getStoredRedirectUrl,
} from '../../../features/auth';

function toErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Could not finish PKCE callback.';
}

export function CallbackPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      try {
        // Exchange the code from the URL for a token
        await completePkceFlow(window.location.search);

        if (isMounted) {
          const redirectUrl = getStoredRedirectUrl();
          const safeRedirectUrl =
            redirectUrl && redirectUrl.startsWith('/') ? redirectUrl : '/gallery';

          clearStoredRedirectUrl();
          navigate(safeRedirectUrl, { replace: true });
        }
      } catch (err) {
        if (isMounted) {
          setError(toErrorMessage(err));
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-8'>
      <LanguageSwitcher className='mb-4 self-end' />

      <div className='w-full rounded-xl border border-border bg-card/95 p-8 text-center shadow-lg'>
        {error ? (
          <div className='animate-in fade-in zoom-in-95 duration-300'>
            <h1 className='text-2xl font-bold text-foreground'>
              {t('callback.failedTitle')}
            </h1>
            <p className='mt-3 text-sm text-destructive font-medium'>{error}</p>
            <div className='mt-8 flex flex-col sm:flex-row justify-center gap-3'>
              <Button
                type='button'
                onClick={() => navigate('/sign-in', { replace: true })}
              >
                {t('callback.retryFlow')}
              </Button>
              <Button variant='outline' asChild>
                <Link to='/sign-in'>{t('common.backToSignIn')}</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className='flex flex-col items-center gap-4'>
            {/* You could add a Spinner component here later */}
            <h1 className='text-2xl font-bold text-foreground animate-pulse'>
              {t('callback.signingInTitle')}
            </h1>
            <p className='text-sm text-muted-foreground'>
              {t('callback.validating')}
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
