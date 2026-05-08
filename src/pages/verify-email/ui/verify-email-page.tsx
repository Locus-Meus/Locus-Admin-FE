import { AxiosError } from 'axios';
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { authApi } from '@/features/auth';
import { Button, LanguageSwitcher } from '@/shared/ui';

type VerifyEmailStatus = 'loading' | 'success' | 'error';
type VerifyEmailErrorKind = 'missing-token' | 'expired' | 'generic';

interface VerifyEmailErrorState {
  kind: VerifyEmailErrorKind;
  message?: string;
}

interface BackendErrorPayload {
  message?: unknown;
  error?: unknown;
  detail?: unknown;
  title?: unknown;
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const normalized = value.trim();
  return normalized.length > 0 ? normalized : null;
}

function extractBackendErrorMessage(data: unknown): string | null {
  const directMessage = toNonEmptyString(data);
  if (directMessage) return directMessage;

  if (!data || typeof data !== 'object') {
    return null;
  }

  const payload = data as BackendErrorPayload;

  return (
    toNonEmptyString(payload.message) ??
    toNonEmptyString(payload.error) ??
    toNonEmptyString(payload.detail) ??
    toNonEmptyString(payload.title)
  );
}

function parseVerifyEmailError(error: unknown): VerifyEmailErrorState {
  if (error instanceof AxiosError) {
    const backendMessage = extractBackendErrorMessage(error.response?.data);
    const fallbackMessage = toNonEmptyString(error.message);
    const message = backendMessage ?? fallbackMessage ?? undefined;
    const status = error.response?.status;

    if (status === 410 || (message && /expired/i.test(message))) {
      return { kind: 'expired' };
    }

    return { kind: 'generic', message };
  }

  if (error instanceof Error) {
    if (/expired/i.test(error.message)) {
      return { kind: 'expired' };
    }

    return { kind: 'generic', message: error.message };
  }

  return { kind: 'generic' };
}

export function VerifyEmailPage() {
  const { t } = useTranslation();
  const token = useMemo(() => {
    const value = new URLSearchParams(window.location.search).get('token');
    return value?.trim() ? value.trim() : null;
  }, []);
  const [status, setStatus] = useState<VerifyEmailStatus>('loading');
  const [error, setError] = useState<VerifyEmailErrorState | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let isMounted = true;

    const verifyEmail = async () => {
      if (!token) {
        if (isMounted) {
          setError({ kind: 'missing-token' });
          setStatus('error');
        }
        return;
      }

      if (isMounted) {
        setError(null);
        setStatus('loading');
      }

      try {
        await authApi.verifyEmail(token);

        if (isMounted) {
          setStatus('success');
        }
      } catch (err) {
        if (isMounted) {
          setError(parseVerifyEmailError(err));
          setStatus('error');
        }
      }
    };

    void verifyEmail();

    return () => {
      isMounted = false;
    };
  }, [attempt, token]);

  const title =
    status === 'success'
      ? t('verifyEmail.successTitle')
      : status === 'error' && error?.kind === 'expired'
        ? t('verifyEmail.expiredTitle')
        : status === 'error'
          ? t('verifyEmail.failedTitle')
          : t('verifyEmail.verifyingTitle');

  const description =
    status === 'success'
      ? t('verifyEmail.successDescription')
      : status === 'error' && error?.kind === 'missing-token'
        ? t('verifyEmail.missingToken')
        : status === 'error' && error?.kind === 'expired'
          ? t('verifyEmail.expiredMessage')
          : status === 'error'
            ? error?.message || t('verifyEmail.failedMessage')
            : t('verifyEmail.verifyingDescription');

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-2xl flex-col justify-center px-4 py-8'>
      <LanguageSwitcher className='mb-4 self-end' />

      <div className='w-full rounded-xl border border-border bg-card/95 p-8 text-center shadow-lg'>
        <div className='animate-in fade-in zoom-in-95 duration-300'>
          <h1
            className={
              status === 'loading'
                ? 'text-2xl font-bold text-foreground animate-pulse'
                : 'text-2xl font-bold text-foreground'
            }
          >
            {title}
          </h1>
          <p
            className={`mt-3 text-sm ${
              status === 'error'
                ? 'font-medium text-destructive'
                : 'text-muted-foreground'
            }`}
          >
            {description}
          </p>

          {status !== 'loading' && (
            <div className='mt-8 flex flex-col justify-center gap-3 sm:flex-row'>
              {status === 'error' && token && (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => setAttempt((value) => value + 1)}
                >
                  {t('common.retry')}
                </Button>
              )}
              <Button asChild>
                <Link to='/sign-in'>{t('common.backToSignIn')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
