import { useTheme } from '@jsfsi-core/ts-react';
import { Moon, Sun, LaptopMinimal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    { value: 'light', labelKey: 'themeToggle.options.light', icon: Sun },
    { value: 'dark', labelKey: 'themeToggle.options.dark', icon: Moon },
    { value: 'system', labelKey: 'themeToggle.options.system', icon: LaptopMinimal },
  ] as const;

  /* v8 ignore next -- @preserve */
  const currentTheme = themes.find((t) => t.value === theme) || themes[2];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <currentTheme.icon className="h-4 w-4" />
          <span className="sr-only">{t('themeToggle.title')}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {themes.map((themeOption) => {
          const Icon = themeOption.icon;
          return (
            <DropdownMenuItem
              key={themeOption.value}
              onClick={() => setTheme(themeOption.value)}
              className={theme === themeOption.value ? 'bg-accent' : ''}
            >
              <Icon className="mr-2 h-4 w-4" />
              {t(themeOption.labelKey)}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
