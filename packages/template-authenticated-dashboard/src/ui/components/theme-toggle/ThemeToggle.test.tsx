import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '../../app/App';
import i18n from '../../i18n/i18n';

import { ThemeToggle } from './ThemeToggle';

describe('ThemeToggle', () => {
  describe('render', () => {
    it('displays theme toggle button', () => {
      const { getByText } = render(
        <AppProviders>
          <ThemeToggle />
        </AppProviders>,
      );

      expect(getByText(i18n.t('themeToggle.title'))).toBeInTheDocument();
    });

    it('changes theme when a theme option is clicked', async () => {
      const user = userEvent.setup();

      const { getByText, getByRole } = render(
        <AppProviders>
          <ThemeToggle />
        </AppProviders>,
      );

      await user.click(getByRole('button'));
      await user.click(getByText(i18n.t('themeToggle.options.dark')));

      await user.click(getByRole('button'));
      await user.click(getByText(i18n.t('themeToggle.options.light')));

      await user.click(getByRole('button'));
      await user.click(getByText(i18n.t('themeToggle.options.system')));
    });
  });
});
