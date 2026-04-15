import { mock, Ok } from '@jsfsi-core/ts-crossplatform';
import { User } from '@jsfsi-core/ts-react';
import { render, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';

import { AppBindingsOverrides } from '../../../../test/app-bindings-overrides';
import { AuthenticationService } from '../../../domain/services/AuthenticationService';
import { AppProviders } from '../../app/App';

import { DashboardPage } from './DashboardPage';

describe('DashboardPage', () => {
  describe('render', () => {
    it('render dashboard page', async () => {
      const testUser = mock<User>({ email: 'test@example.com' });

      const authenticationService = mock<AuthenticationService>({
        onAuthStateChanged: (callback) => {
          callback(testUser);
          return vi.fn();
        },
        signIn: vi.fn().mockResolvedValue(Ok(testUser)),
        signOut: vi.fn().mockResolvedValue(undefined),
        signInWithEmailAndPassword: vi.fn().mockResolvedValue(Ok(testUser)),
        signUp: vi.fn().mockResolvedValue(Ok(testUser)),
        signUpWithEmailAndPassword: vi.fn().mockResolvedValue(Ok(testUser)),
        sendPasswordResetEmail: vi.fn().mockResolvedValue(Ok(undefined)),
      });

      const { getByText } = render(
        <MemoryRouter>
          <AppProviders
            bindings={AppBindingsOverrides({
              overrides: [{ type: AuthenticationService, instance: authenticationService }],
            })}
          >
            <DashboardPage />
          </AppProviders>
        </MemoryRouter>,
      );

      await waitFor(() => {
        expect(getByText('Welcome, test@example.com')).toBeInTheDocument();
      });
    });
  });
});
