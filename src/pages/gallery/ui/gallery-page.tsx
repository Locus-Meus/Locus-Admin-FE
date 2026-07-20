import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

/* FSD Imports */
import { useSessionStore } from '@/entities/session';
import { authApi } from '@/features/auth';
import {
  Button,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  LanguageSwitcher,
} from '@/shared/ui';
import { ImageList } from './image-list';
import { ImageUpload } from './image-upload';

/**
 * Utility to shorten long JWT tokens for display
 */
function shorten(value: string | null, fallback: string): string {
  if (!value) return fallback;
  if (value.length <= 28) return value;
  return `${value.slice(0, 14)}...${value.slice(-10)}`;
}

export function GalleryPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Get tokens from Zustand Store */
  const { token, logout: clearSession } = useSessionStore();

  const handleLogout = async () => {
    setIsPending(true);
    setError(null);

    try {
      const csrfToken = await authApi.getCsrfToken();

      await authApi.logout(csrfToken);

      clearSession();
      navigate('/', { replace: true });
    } catch (err) {
      // We still proceed with local logout even if server call fails
      setError(err instanceof Error ? err.message : t('gallery.logoutFailed'));
    } finally {
      setIsPending(false);
    }
  };

  const copyToken = async () => {
    navigator.clipboard.writeText(token)
    .then(() => {
      console.log('Text successfully copied to clipboard');
    })
    .catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <main className='mx-auto min-h-screen w-full max-w-6xl px-4 py-8'>
      <LanguageSwitcher className='mb-4 justify-end' />

      <section className='rounded-2xl border border-border bg-card/95 p-8 shadow-sm'>
        <header className='flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
          <div>
            <h1 className='text-3xl font-semibold text-foreground'>
              {t('gallery.title')}
            </h1>
            <p className='mt-2 text-sm text-muted-foreground'>
              {t('gallery.description')}
            </p>
          </div>
          <Button
            variant='destructive'
            onClick={handleLogout}
            disabled={isPending}
          >
            {isPending ? t('gallery.signingOut') : t('gallery.signOut')}
          </Button>
        </header>

        <Tabs className='mt-8 w-full' defaultValue='gallery'>
          <TabsList className='grid w-full grid-cols-2 sm:w-auto'>
            <TabsTrigger value='gallery'>{t('gallery.galleryTab')}</TabsTrigger>
            <TabsTrigger value='blog'>{t('gallery.blogTab')}</TabsTrigger>
          </TabsList>

          <TabsContent value='gallery'>
            <div className='mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]'>
              <div className='grid gap-4'>
                <ImageUpload
                  onUploaded={() => {
                    void queryClient.invalidateQueries({
                      queryKey: ['admin-images'],
                    });
                  }}
                />
                <ImageList />
              </div>

              <div className='rounded-xl border border-border bg-background p-4'>
                <p className='text-xs uppercase tracking-[0.08em] text-muted-foreground'>
                  {t('gallery.accessToken')}
                </p>
                <p className='mt-2 break-all font-mono text-sm text-foreground bg-muted/30 p-2 rounded'>
                  {shorten(token, t('gallery.tokenNotAvailable'))}
                </p>
                <Button
                    variant='outline'
                    onClick={copyToken}
                    disabled={isPending}
                >
                  {isPending ? 'Wait...' : 'Copy Token'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value='blog'>
            <div className='mt-4 rounded-xl border border-dashed border-border bg-background p-8 text-center text-sm text-muted-foreground'>
              {t('gallery.blogPlaceholder')}
            </div>
          </TabsContent>
        </Tabs>

        {error && (
          <p className='mt-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive'>
            {error}
          </p>
        )}
      </section>
    </main>
  );
}
