import { render } from '@testing-library/react';
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
  });
});
