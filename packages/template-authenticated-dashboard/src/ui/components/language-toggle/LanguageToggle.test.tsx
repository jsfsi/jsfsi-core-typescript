import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';

import { AppProviders } from '../../app/App';
import i18n from '../../i18n/i18n';

import { LanguageToggle } from './LanguageToggle';

describe('LanguageToggle', () => {
  describe('render', () => {
    it('displays language toggle button', () => {
      const { getByText } = render(
        <AppProviders>
          <LanguageToggle />
        </AppProviders>,
      );

      expect(getByText(i18n.t('languageToggle.title'))).toBeInTheDocument();
    });

    it('changes language when a language option is clicked', async () => {
      const user = userEvent.setup();

      const { getByText, getByRole } = render(
        <AppProviders>
          <LanguageToggle />
        </AppProviders>,
      );

      await user.click(getByRole('button'));
      await user.click(getByText('Português'));

      expect(i18n.language).toBe('pt');

      await user.click(getByRole('button'));
      await user.click(getByText('English'));

      expect(i18n.language).toBe('en');
    });
  });
});
