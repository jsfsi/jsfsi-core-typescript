import { Fail, mock, Ok, sleep } from '@jsfsi-core/ts-crossplatform';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SignInFailure } from '../../../domain/models/SignInFailure';
import { User } from '../../../domain/models/User';
import { AppProviders } from '../../app/App';
import { AuthContextType } from '../../components/auth/AuthContext';
import * as AuthContext from '../../components/auth/AuthContext';
import * as CrashlyticsContext from '../../components/error-boundary/CrashlyticsContext';
import i18n from '../../i18n/i18n';

import { LoginForm } from './LoginForm';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('LoginForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('displays title', () => {
      const { getByText, getByPlaceholderText } = render(
        <MemoryRouter>
          <AppProviders>
            <LoginForm />
          </AppProviders>
        </MemoryRouter>,
      );

      expect(getByText(i18n.t('login.title'))).toBeInTheDocument();
      expect(getByText(i18n.t('login.description'))).toBeInTheDocument();
      expect(getByText(i18n.t('login.email'))).toBeInTheDocument();
      expect(getByPlaceholderText(i18n.t('login.emailPlaceholder'))).toBeInTheDocument();
      expect(getByText(i18n.t('login.password'))).toBeInTheDocument();
      expect(getByText(i18n.t('login.submitWithUsernameAndPassword'))).toBeInTheDocument();
      expect(getByText(i18n.t('login.orContinueWith'))).toBeInTheDocument();
      expect(getByText(i18n.t('login.submitWithGoogle'))).toBeInTheDocument();
      expect(getByText(i18n.t('login.noAccount'))).toBeInTheDocument();
      expect(getByText(i18n.t('login.signUp'))).toBeInTheDocument();
    });
  });

  describe('behaviour', () => {
    describe('sign in with google', () => {
      it('should sign in with google', async () => {
        const toastSuccessSpy = vi.spyOn(toast, 'success');
        const signInpMock = vi
          .fn()
          .mockResolvedValue(Ok(mock<User>({ email: 'test@example.com' })));
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
          mock<AuthContextType>({ currentUser: null, signIn: signInpMock }),
        );

        const { getByText } = render(
          <MemoryRouter>
            <AppProviders>
              <LoginForm />
            </AppProviders>
          </MemoryRouter>,
        );

        const googleSignInButton = getByText(i18n.t('login.submitWithGoogle'));

        await act(async () => {
          googleSignInButton.click();
        });

        expect(toastSuccessSpy).toHaveBeenCalledTimes(1);
        expect(toastSuccessSpy).toHaveBeenCalledWith(i18n.t('login.success'));

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/');

        expect(signInpMock).toHaveBeenCalledTimes(1);
        expect(signInpMock).toHaveBeenCalledWith();
      });

      it('reports failure and shows notification when fails to sign in', async () => {
        const toastErrorSpy = vi.spyOn(toast, 'error');
        const reportFailureMock = vi.fn();
        vi.spyOn(CrashlyticsContext, 'useCrashlytics').mockReturnValue({
          reportFailure: reportFailureMock,
        });
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
          mock<AuthContextType>({
            currentUser: null,
            signIn: vi
              .fn()
              .mockResolvedValue(Fail(new SignInFailure(new Error('some sign in error')))),
          }),
        );

        const { getByText } = render(
          <AppProviders>
            <MemoryRouter>
              <LoginForm />
            </MemoryRouter>
          </AppProviders>,
        );

        const googleSignInButton = getByText(i18n.t('login.submitWithGoogle'));

        await act(async () => {
          googleSignInButton.click();
        });

        expect(toastErrorSpy).toHaveBeenCalledTimes(1);
        expect(toastErrorSpy).toHaveBeenCalledWith(i18n.t('login.errors.googleFailed'));
        expect(reportFailureMock).toHaveBeenCalledTimes(1);
        expect(reportFailureMock).toHaveBeenCalledWith(
          'Failed to sign in',
          new SignInFailure(new Error('some sign in error')),
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    describe('sign in with username and password', () => {
      it('should sign in with username and password', async () => {
        const toastSuccessSpy = vi.spyOn(toast, 'success');
        const signInWithEmailAndPasswordMock = vi.fn().mockImplementation(async () => {
          await sleep(10);
          return Ok(mock<User>({ email: 'test@example.com' }));
        });
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
          mock<AuthContextType>({
            currentUser: null,
            signInWithEmailAndPassword: signInWithEmailAndPasswordMock,
          }),
        );

        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter>
            <AppProviders>
              <LoginForm />
            </AppProviders>
          </MemoryRouter>,
        );

        const emailInput = getByPlaceholderText(i18n.t('login.emailPlaceholder'));
        const passwordInput = getByPlaceholderText(i18n.t('login.password'));

        await act(async () => {
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          fireEvent.change(passwordInput, { target: { value: 'some-password' } });
        });

        const signInButton = getByText(i18n.t('login.submitWithUsernameAndPassword'));

        await act(async () => {
          signInButton.click();
        });

        await waitFor(() => {
          expect(toastSuccessSpy).toHaveBeenCalledTimes(1);
          expect(toastSuccessSpy).toHaveBeenCalledWith(i18n.t('login.success'));

          expect(mockNavigate).toHaveBeenCalledTimes(1);
          expect(mockNavigate).toHaveBeenCalledWith('/');

          expect(signInWithEmailAndPasswordMock).toHaveBeenCalledTimes(1);
          expect(signInWithEmailAndPasswordMock).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'some-password',
          });
        });
      });

      it('reports failure and shows notification when fails to sign in', async () => {
        const toastErrorSpy = vi.spyOn(toast, 'error');
        const reportFailureMock = vi.fn();
        vi.spyOn(CrashlyticsContext, 'useCrashlytics').mockReturnValue({
          reportFailure: reportFailureMock,
        });
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
          mock<AuthContextType>({
            currentUser: null,
            signInWithEmailAndPassword: vi
              .fn()
              .mockResolvedValue(Fail(new SignInFailure(new Error('some sign in error')))),
          }),
        );

        const { getByPlaceholderText, getByText } = render(
          <AppProviders>
            <MemoryRouter>
              <LoginForm />
            </MemoryRouter>
          </AppProviders>,
        );

        const emailInput = getByPlaceholderText(i18n.t('login.emailPlaceholder'));
        const passwordInput = getByPlaceholderText(i18n.t('login.password'));

        await act(async () => {
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          fireEvent.change(passwordInput, { target: { value: 'some-password' } });
        });

        const signInButton = getByText(i18n.t('login.submitWithUsernameAndPassword'));

        await act(async () => {
          signInButton.click();
        });

        expect(toastErrorSpy).toHaveBeenCalledTimes(1);
        expect(toastErrorSpy).toHaveBeenCalledWith(i18n.t('login.errors.usernamePasswordFailed'));
        expect(reportFailureMock).toHaveBeenCalledTimes(1);
        expect(reportFailureMock).toHaveBeenCalledWith(
          'Failed to sign in',
          new SignInFailure(new Error('some sign in error')),
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      it('navigates to signup page when user presses sign up link', async () => {
        const { getByText } = render(
          <MemoryRouter>
            <AppProviders>
              <LoginForm />
            </AppProviders>
          </MemoryRouter>,
        );

        const signUpLink = getByText(i18n.t('login.signUp'));

        await act(async () => {
          signUpLink.click();
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login/signup');
      });

      it('navigates to reset password page when user presses reset password link', async () => {
        const { getByText } = render(
          <MemoryRouter>
            <AppProviders>
              <LoginForm />
            </AppProviders>
          </MemoryRouter>,
        );

        const resetPasswordLink = getByText(i18n.t('login.forgotPassword'));

        await act(async () => {
          resetPasswordLink.click();
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login/reset-password');
      });
    });
  });
});
