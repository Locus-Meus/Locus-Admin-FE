import { useTranslation } from 'react-i18next';
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/ui';
import { navigateToLogin } from '@/features/auth';
import { LanguageSwitcher } from '@/shared/ui/language-switcher';
import { AUTH_CONFIG, resolveEndpoint } from '@/shared/config/auth';

export function SignInPage() {
  const { t } = useTranslation();

  const handleSignIn = async () => {
    await navigateToLogin();
  };

  const handleSignUp = () => {
    window.location.href = resolveEndpoint(AUTH_CONFIG.endpoints.signUp);
  };

  return (
    <main className='mx-auto flex min-h-screen w-full max-w-6xl flex-col justify-center px-4 py-8'>
      <div className='mb-4 self-end'>
        <LanguageSwitcher />
      </div>

      <Card className='w-full max-w-md self-center bg-card/95 shadow-lg'>
        <CardHeader className='space-y-1'>
          <CardTitle className='text-2xl font-bold tracking-tight'>
            {t('auth.welcome.title')}
          </CardTitle>
          <CardDescription>{t('auth.welcome.description')}</CardDescription>
        </CardHeader>
        <CardContent className='space-y-3'>
          <Button className='w-full' type='button' onClick={handleSignIn}>
            {t('auth.signIn.submit')}
          </Button>
          <Button
            className='w-full'
            type='button'
            variant='outline'
            onClick={handleSignUp}
          >
            {t('auth.signUp.submit')}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
