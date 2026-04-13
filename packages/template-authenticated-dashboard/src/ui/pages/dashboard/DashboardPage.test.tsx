import { mock } from '@jsfsi-core/ts-crossplatform';
import * as TsReact from '@jsfsi-core/ts-react';
import { type AuthValue } from '@jsfsi-core/ts-react';
import { User } from '@jsfsi-core/ts-react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AppProviders } from '../../app/App';

import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  describe('render', () => {
    it('render dashboard page', () => {
      const user = mock<User>({
        email: 'test@example.com',
      });

      vi.spyOn(TsReact, 'useAuth').mockReturnValue(
        mock<AuthValue<User>>({
          currentUser: user,
        }),
      );

      const { getByText } = render(
        <MemoryRouter>
          <AppProviders>
            <DashboardPage />
          </AppProviders>
        </MemoryRouter>,
      );

      expect(getByText('Welcome, test@example.com')).toBeInTheDocument();
    });
  });
});
