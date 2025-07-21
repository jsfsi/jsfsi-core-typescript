import { mock } from '@jsfsi-core/ts-crossplatform';
import { render, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

import { User } from '../../../domain/models/User';
import * as AuthContext from '../../components/auth/AuthContext';
import { AuthContextType } from '../../components/auth/AuthContext';
import { SidebarProvider } from '../../components/sidebar';
import i18n from '../../i18n/i18n';

import { AppUser } from './AppUser';

describe('AppUser', () => {
  describe('render', () => {
    it('renders app user with user email', () => {
      const user = mock<User>({
        email: 'test@example.com',
        name: 'Test User',
      });

      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
          currentUser: user,
        }),
      );

      const { getByText } = render(
        <SidebarProvider>
          <AppUser />
        </SidebarProvider>,
      );

      expect(getByText('test@example.com')).toBeInTheDocument();
      expect(getByText('Test User')).toBeInTheDocument();
    });

    it('renders app user without user email', () => {
      const user = mock<User>({
        name: 'Test User',
      });

      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
          currentUser: user,
        }),
      );

      const { getByText } = render(
        <SidebarProvider>
          <AppUser />
        </SidebarProvider>,
      );

      expect(getByText('Test User')).toBeInTheDocument();
    });

    it('renders app user without user', () => {
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
          currentUser: undefined,
        }),
      );
      const WrappedAppUser = () => (
        <div data-testid="app-user-wrapper">
          <AppUser />
        </div>
      );

      const { getByTestId } = render(
        <SidebarProvider>
          <WrappedAppUser />
        </SidebarProvider>,
      );

      const wrapper = getByTestId('app-user-wrapper');
      expect(wrapper).toBeEmptyDOMElement();
    });

    it('renders app user without user name', () => {
      const user = mock<User>({
        email: 'test@example.com',
      });

      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
          currentUser: user,
        }),
      );

      const { getByText } = render(
        <SidebarProvider>
          <AppUser />
        </SidebarProvider>,
      );

      expect(getByText('test@example.com')).toBeInTheDocument();
    });
  });

  describe('behavior', () => {
    it('logs out user', async () => {
      const user = userEvent.setup();
      const signOutMock = vi.fn();
      const userData = mock<User>({
        email: 'test@example.com',
        name: 'Test User',
      });

      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
          currentUser: userData,
          signOut: signOutMock,
        }),
      );

      const { getByText } = render(
        <SidebarProvider>
          <AppUser />
        </SidebarProvider>,
      );

      const dropdownMenuTrigger = getByText('test@example.com');
      await user.click(dropdownMenuTrigger);

      await waitFor(async () => {
        const logOutButton = getByText(i18n.t('appUser.logOut'));
        await user.click(logOutButton);
      });

      expect(signOutMock).toHaveBeenCalledTimes(1);
      expect(signOutMock).toHaveBeenCalledWith();
    });
  });
});
