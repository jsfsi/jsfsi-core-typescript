import { mock } from '@jsfsi-core/ts-crossplatform';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { User } from '../../../domain/models/User';
import { App, AppProviders } from '../../app/App';
import * as AuthContext from '../../components/auth/AuthContext';
import { AuthContextType } from '../../components/auth/AuthContext';
import i18n from '../../i18n/i18n';

import { LoginPage } from './LoginPage';

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('./LoginForm', () => ({
  LoginForm: () => <div>Login Form</div>,
}));

describe('LoginPage', () => {
  describe('render', () => {
    it('displays login form', () => {
      const { getByText } = render(<App />);

      expect(getByText(i18n.t('app.name'))).toBeInTheDocument();
      expect(getByText('Login Form')).toBeInTheDocument();
    });

    it('redirects to dashboard when user is already logged in', async () => {
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
          currentUser: mock<User>({
            email: 'test@example.com',
          }),
        }),
      );

      render(
        <AppProviders>
          <LoginPage />
        </AppProviders>,
      );

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
