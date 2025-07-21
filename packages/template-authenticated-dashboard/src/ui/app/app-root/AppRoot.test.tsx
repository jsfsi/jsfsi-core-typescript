import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import i18n from '../../i18n/i18n';

import { AppRoot } from './AppRoot';

vi.mock('./AppSidebar', () => ({
  AppSidebar: () => <div>App Sidebar</div>,
}));

describe('AppRoot', () => {
  describe('render', () => {
    it('renders app root', () => {
      const { getByText } = render(<AppRoot />);

      expect(getByText(i18n.t('app.name'))).toBeInTheDocument();
      expect(getByText('App Sidebar')).toBeInTheDocument();
    });
  });
});
