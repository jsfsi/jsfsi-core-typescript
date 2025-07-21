import { Fail, mock, Ok, sleep } from '@jsfsi-core/ts-crossplatform';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { SignUpFailure } from '../../../domain/models/SignUpFailure';
import { User } from '../../../domain/models/User';
import { AppProviders } from '../../app/App';
import { AuthContextType } from '../../components/auth/AuthContext';
import * as AuthContext from '../../components/auth/AuthContext';
import * as CrashlyticsContext from '../../components/error-boundary/CrashlyticsContext';
import i18n from '../../i18n/i18n';

import { SignupForm } from './SignupForm';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('SignupForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('displays title', () => {
      const { getByText, getByPlaceholderText } = render(
        <MemoryRouter>
          <AppProviders>
            <SignupForm />
          </AppProviders>
        </MemoryRouter>,
      );

      expect(getByText(i18n.t('signup.title'))).toBeInTheDocument();
      expect(getByText(i18n.t('signup.description'))).toBeInTheDocument();
      expect(getByText(i18n.t('signup.email'))).toBeInTheDocument();
      expect(getByPlaceholderText(i18n.t('signup.emailPlaceholder'))).toBeInTheDocument();
      expect(getByText(i18n.t('signup.password'))).toBeInTheDocument();
      expect(getByText(i18n.t('signup.confirmPassword'))).toBeInTheDocument();
      expect(getByPlaceholderText(i18n.t('signup.confirmPassword'))).toBeInTheDocument();
      expect(getByText(i18n.t('signup.submitWithUsernameAndPassword'))).toBeInTheDocument();
      expect(getByText(i18n.t('signup.orContinueWith'))).toBeInTheDocument();
      expect(getByText(i18n.t('signup.submitWithGoogle'))).toBeInTheDocument();
      expect(getByText(i18n.t('signup.alreadyHaveAccount'))).toBeInTheDocument();
      expect(getByText(i18n.t('signup.signIn'))).toBeInTheDocument();
    });
  });

  describe('behaviour', () => {
    describe('sign up with google', () => {
      it('should sign up with google', async () => {
        const toastSuccessSpy = vi.spyOn(toast, 'success');
        const signUpMock = vi.fn().mockResolvedValue(Ok(mock<User>({ email: 'test@example.com' })));
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
          mock<AuthContextType>({ currentUser: null, signUp: signUpMock }),
        );

        const { getByText } = render(
          <MemoryRouter>
            <AppProviders>
              <SignupForm />
            </AppProviders>
          </MemoryRouter>,
        );

        const googleSignUpButton = getByText(i18n.t('signup.submitWithGoogle'));

        await act(async () => {
          googleSignUpButton.click();
        });

        expect(toastSuccessSpy).toHaveBeenCalledTimes(1);
        expect(toastSuccessSpy).toHaveBeenCalledWith(i18n.t('signup.success'));

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/');

        expect(signUpMock).toHaveBeenCalledTimes(1);
        expect(signUpMock).toHaveBeenCalledWith();
      });

      it('reports failure and shows notification when fails to sign up', async () => {
        const toastErrorSpy = vi.spyOn(toast, 'error');
        const reportFailureMock = vi.fn();
        vi.spyOn(CrashlyticsContext, 'useCrashlytics').mockReturnValue({
          reportFailure: reportFailureMock,
        });
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
          mock<AuthContextType>({
            currentUser: null,
            signUp: vi
              .fn()
              .mockResolvedValue(Fail(new SignUpFailure(new Error('some sign up error')))),
          }),
        );

        const { getByText } = render(
          <AppProviders>
            <MemoryRouter>
              <SignupForm />
            </MemoryRouter>
          </AppProviders>,
        );

        const googleSignUpButton = getByText(i18n.t('signup.submitWithGoogle'));

        await act(async () => {
          googleSignUpButton.click();
        });

        expect(toastErrorSpy).toHaveBeenCalledTimes(1);
        expect(toastErrorSpy).toHaveBeenCalledWith(i18n.t('signup.errors.googleFailed'));
        expect(reportFailureMock).toHaveBeenCalledTimes(1);
        expect(reportFailureMock).toHaveBeenCalledWith(
          'Failed to sign up',
          new SignUpFailure(new Error('some sign up error')),
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });
    });

    describe('sign up with username and password', () => {
      it('should sign up with username and password', async () => {
        const toastSuccessSpy = vi.spyOn(toast, 'success');
        const signUpWithEmailAndPasswordMock = vi.fn().mockImplementation(async () => {
          await sleep(10);
          return Ok(mock<User>({ email: 'test@example.com' }));
        });
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
          mock<AuthContextType>({
            currentUser: null,
            signUpWithEmailAndPassword: signUpWithEmailAndPasswordMock,
          }),
        );

        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter>
            <AppProviders>
              <SignupForm />
            </AppProviders>
          </MemoryRouter>,
        );

        const emailInput = getByPlaceholderText(i18n.t('signup.emailPlaceholder'));
        const passwordInput = getByPlaceholderText(i18n.t('signup.password'));
        const confirmPasswordInput = getByPlaceholderText(i18n.t('signup.confirmPassword'));

        await act(async () => {
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          fireEvent.change(passwordInput, { target: { value: 'some-password' } });
          fireEvent.change(confirmPasswordInput, { target: { value: 'some-password' } });
        });

        const signUpButton = getByText(i18n.t('signup.submitWithUsernameAndPassword'));

        await act(async () => {
          signUpButton.click();
        });

        await waitFor(() => {
          expect(toastSuccessSpy).toHaveBeenCalledTimes(1);
          expect(toastSuccessSpy).toHaveBeenCalledWith(i18n.t('signup.success'));

          expect(mockNavigate).toHaveBeenCalledTimes(1);
          expect(mockNavigate).toHaveBeenCalledWith('/');

          expect(signUpWithEmailAndPasswordMock).toHaveBeenCalledTimes(1);
          expect(signUpWithEmailAndPasswordMock).toHaveBeenCalledWith({
            email: 'test@example.com',
            password: 'some-password',
          });
        });
      });

      it('reports failure and shows notification when fails to sign up', async () => {
        const toastErrorSpy = vi.spyOn(toast, 'error');
        const reportFailureMock = vi.fn();
        vi.spyOn(CrashlyticsContext, 'useCrashlytics').mockReturnValue({
          reportFailure: reportFailureMock,
        });
        vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
          mock<AuthContextType>({
            currentUser: null,
            signUpWithEmailAndPassword: vi
              .fn()
              .mockResolvedValue(Fail(new SignUpFailure(new Error('some sign up error')))),
          }),
        );

        const { getByPlaceholderText, getByText } = render(
          <AppProviders>
            <MemoryRouter>
              <SignupForm />
            </MemoryRouter>
          </AppProviders>,
        );

        const emailInput = getByPlaceholderText(i18n.t('signup.emailPlaceholder'));
        const passwordInput = getByPlaceholderText(i18n.t('signup.password'));
        const confirmPasswordInput = getByPlaceholderText(i18n.t('signup.confirmPassword'));

        await act(async () => {
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          fireEvent.change(passwordInput, { target: { value: 'some-password' } });
          fireEvent.change(confirmPasswordInput, { target: { value: 'some-password' } });
        });

        const signUpButton = getByText(i18n.t('signup.submitWithUsernameAndPassword'));

        await act(async () => {
          signUpButton.click();
        });

        expect(toastErrorSpy).toHaveBeenCalledTimes(1);
        expect(toastErrorSpy).toHaveBeenCalledWith(i18n.t('signup.errors.usernamePasswordFailed'));
        expect(reportFailureMock).toHaveBeenCalledTimes(1);
        expect(reportFailureMock).toHaveBeenCalledWith(
          'Failed to sign up',
          new SignUpFailure(new Error('some sign up error')),
        );
        expect(mockNavigate).not.toHaveBeenCalled();
      });

      it('shows error when passwords do not match', async () => {
        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter>
            <AppProviders>
              <SignupForm />
            </AppProviders>
          </MemoryRouter>,
        );

        const emailInput = getByPlaceholderText(i18n.t('signup.emailPlaceholder'));
        const passwordInput = getByPlaceholderText(i18n.t('signup.password'));
        const confirmPasswordInput = getByPlaceholderText(i18n.t('signup.confirmPassword'));

        await act(async () => {
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          fireEvent.change(passwordInput, { target: { value: 'some-password' } });
          fireEvent.change(confirmPasswordInput, { target: { value: 'different-password' } });
        });

        const signUpButton = getByText(i18n.t('signup.submitWithUsernameAndPassword'));

        await act(async () => {
          signUpButton.click();
        });

        expect(getByText(i18n.t('signup.errors.passwordsDoNotMatch'))).toBeInTheDocument();
      });

      it('shows error when confirm password is empty', async () => {
        const { getByText, getByPlaceholderText } = render(
          <MemoryRouter>
            <AppProviders>
              <SignupForm />
            </AppProviders>
          </MemoryRouter>,
        );

        const emailInput = getByPlaceholderText(i18n.t('signup.emailPlaceholder'));
        const passwordInput = getByPlaceholderText(i18n.t('signup.password'));

        await act(async () => {
          fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
          fireEvent.change(passwordInput, { target: { value: 'some-password' } });
        });

        const signUpButton = getByText(i18n.t('signup.submitWithUsernameAndPassword'));

        await act(async () => {
          signUpButton.click();
        });

        expect(getByText(i18n.t('signup.errors.confirmPasswordRequired'))).toBeInTheDocument();
      });

      it('navigates to login page when user presses sign in link', async () => {
        const { getByText } = render(
          <MemoryRouter>
            <AppProviders>
              <SignupForm />
            </AppProviders>
          </MemoryRouter>,
        );

        const signInLink = getByText(i18n.t('signup.signIn'));

        await act(async () => {
          signInLink.click();
        });

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login');
      });
    });
  });
});
