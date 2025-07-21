import { mock } from '@jsfsi-core/ts-crossplatform';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { User } from '../../../domain/models/User';
import { AppProviders } from '../../app/App';
import * as AuthContext from '../../components/auth/AuthContext';
import { AuthContextType } from '../../components/auth/AuthContext';

import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  describe('render', () => {
    it('render dashboard page', () => {
      const user = mock<User>({
        email: 'test@example.com',
      });

      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
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
