import { render } from '@testing-library/react';
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
  });
});
