import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SILENT_AUTH_MESSAGE_TYPE } from '@/features/auth';

export function SilentCallbackPage() {
  const { t } = useTranslation();

  useEffect(() => {
    if (window.parent === window) {
      return;
    }

    window.parent.postMessage(
      {
        type: SILENT_AUTH_MESSAGE_TYPE,
        search: window.location.search,
      },
      window.location.origin,
    );
  }, []);

  return (
    <main className='flex min-h-screen items-center justify-center px-4 py-8'>
      <p className='text-sm text-muted-foreground'>
        {t('callback.validating')}
      </p>
    </main>
  );
}
