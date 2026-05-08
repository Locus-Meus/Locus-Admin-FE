import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/lib/utils';

const SUPPORTED_LANGUAGES = [
  { code: 'en', labelKey: 'common.languages.en' },
  { code: 'es', labelKey: 'common.languages.es' },
  { code: 'ru', labelKey: 'common.languages.ru' },
] as const;

export function LanguageSwitcher({ className }: { className?: string }) {
  const { i18n, t } = useTranslation();

  const currentLanguage = i18n.resolvedLanguage?.slice(0, 2) ?? 'en';

  return (
    <label
      className={cn(
        'flex items-center gap-2 text-xs text-muted-foreground',
        className,
      )}
    >
      <span>{t('common.language')}:</span>
      <select
        className='h-8 rounded-md border border-input bg-background px-2 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring/50'
        value={currentLanguage}
        onChange={(event) => {
          void i18n.changeLanguage(event.target.value);
        }}
      >
        {SUPPORTED_LANGUAGES.map((language) => (
          <option key={language.code} value={language.code}>
            {t(language.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
