import { useTranslation } from 'react-i18next';

import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

/* v8 ignore next -- @preserve */
export function LanguageToggle() {
  const { i18n, t } = useTranslation();

  const languages = [
    { code: 'en', name: 'English', flagCode: 'gb' },
    { code: 'pt', name: 'Português', flagCode: 'pt' },
  ];

  const currentLanguage = languages.find((lang) => lang.code === i18n.language) || languages[0];

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <span
            className="h-4 w-4 inline-block bg-cover bg-center rounded-sm shadow-sm"
            style={{
              backgroundImage: `url('/flags/${currentLanguage.flagCode}.svg')`,
            }}
          />
          <span className="sr-only">{t('languageToggle.title')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className={i18n.language === language.code ? 'bg-accent' : ''}
          >
            <span
              className="mr-2 h-4 w-4 inline-block bg-cover bg-center rounded-sm shadow-sm"
              style={{
                backgroundImage: `url('/flags/${language.flagCode}.svg')`,
              }}
            />
            {language.name}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
