import { Fail, mock, Ok, sleep } from '@jsfsi-core/ts-crossplatform';
import { act, fireEvent, render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { PasswordResetEmailFailure } from '../../../domain/models/PasswordResetEmailFailure';
import { AppProviders } from '../../app/App';
import { AuthContextType } from '../../components/auth/AuthContext';
import * as AuthContext from '../../components/auth/AuthContext';
import * as CrashlyticsContext from '../../components/error-boundary/CrashlyticsContext';
import i18n from '../../i18n/i18n';

import { PasswordResetForm } from './PasswordResetForm';

// Mock the navigation
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('PasswordResetForm', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('render', () => {
    it('displays title and form elements', () => {
      const { getByText, getByPlaceholderText } = render(
        <MemoryRouter>
          <AppProviders>
            <PasswordResetForm />
          </AppProviders>
        </MemoryRouter>,
      );

      expect(getByText(i18n.t('passwordReset.title'))).toBeInTheDocument();
      expect(getByText(i18n.t('passwordReset.description'))).toBeInTheDocument();
      expect(getByText(i18n.t('passwordReset.email'))).toBeInTheDocument();
      expect(getByPlaceholderText(i18n.t('passwordReset.emailPlaceholder'))).toBeInTheDocument();
      expect(getByText(i18n.t('passwordReset.submit'))).toBeInTheDocument();
      expect(getByText(i18n.t('passwordReset.backToLogin'))).toBeInTheDocument();
    });
  });

  describe('behaviour', () => {
    it('should send password reset email successfully', async () => {
      const toastSuccessSpy = vi.spyOn(toast, 'success');
      const sendPasswordResetEmailMock = vi.fn().mockImplementation(async () => {
        await sleep(10);
        return Ok(undefined);
      });
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
          currentUser: null,
          sendPasswordResetEmail: sendPasswordResetEmailMock,
        }),
      );

      const { getByText, getByPlaceholderText } = render(
        <MemoryRouter>
          <AppProviders>
            <PasswordResetForm />
          </AppProviders>
        </MemoryRouter>,
      );

      const emailInput = getByPlaceholderText(i18n.t('passwordReset.emailPlaceholder'));

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      const submitButton = getByText(i18n.t('passwordReset.submit'));

      await act(async () => {
        submitButton.click();
      });

      await waitFor(() => {
        expect(toastSuccessSpy).toHaveBeenCalledTimes(1);
        expect(toastSuccessSpy).toHaveBeenCalledWith(i18n.t('passwordReset.success'));

        expect(mockNavigate).toHaveBeenCalledTimes(1);
        expect(mockNavigate).toHaveBeenCalledWith('/login');

        expect(sendPasswordResetEmailMock).toHaveBeenCalledTimes(1);
        expect(sendPasswordResetEmailMock).toHaveBeenCalledWith('test@example.com');
      });
    });

    it('reports failure and shows notification when fails to send reset email', async () => {
      const toastErrorSpy = vi.spyOn(toast, 'error');
      const reportFailureMock = vi.fn();
      vi.spyOn(CrashlyticsContext, 'useCrashlytics').mockReturnValue({
        reportFailure: reportFailureMock,
      });
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
          currentUser: null,
          sendPasswordResetEmail: vi
            .fn()
            .mockResolvedValue(Fail(new PasswordResetEmailFailure(new Error('some reset error')))),
        }),
      );

      const { getByPlaceholderText, getByText } = render(
        <AppProviders>
          <MemoryRouter>
            <PasswordResetForm />
          </MemoryRouter>
        </AppProviders>,
      );

      const emailInput = getByPlaceholderText(i18n.t('passwordReset.emailPlaceholder'));

      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      });

      const submitButton = getByText(i18n.t('passwordReset.submit'));

      await act(async () => {
        submitButton.click();
      });

      expect(toastErrorSpy).toHaveBeenCalledTimes(1);
      expect(reportFailureMock).toHaveBeenCalledTimes(1);
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('should navigate back to login when back to login link is clicked', () => {
      vi.spyOn(AuthContext, 'useAuth').mockReturnValue(
        mock<AuthContextType>({
          currentUser: null,
          sendPasswordResetEmail: vi.fn(),
        }),
      );

      const { getByText } = render(
        <MemoryRouter>
          <AppProviders>
            <PasswordResetForm />
          </AppProviders>
        </MemoryRouter>,
      );

      const backToLoginLink = getByText(i18n.t('passwordReset.backToLogin'));

      act(() => {
        backToLoginLink.click();
      });

      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });
});
