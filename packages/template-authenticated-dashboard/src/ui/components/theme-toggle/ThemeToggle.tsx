import { Moon, Sun, LaptopMinimal } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useTheme } from '../../theme/ThemeProvider';
import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../dropdown-menu';

/* c8 ignore start */
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { t } = useTranslation();

  const themes = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: LaptopMinimal },
  ];

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
              onClick={() => setTheme(themeOption.value as 'light' | 'dark' | 'system')}
              className={theme === themeOption.value ? 'bg-accent' : ''}
            >
              <Icon className="mr-2 h-4 w-4" />
              {themeOption.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
/* c8 ignore end */
