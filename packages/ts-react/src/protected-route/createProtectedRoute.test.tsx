import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';

import { createProtectedRoute } from './createProtectedRoute';

type TestUser = { id: string };

describe('createProtectedRoute', () => {
  describe('Render', () => {
    it('renders children when user is authenticated', () => {
      const useAuth = () => ({
        currentUser: { id: '1' } as TestUser,
        loading: false,
      });
      const ProtectedRoute = createProtectedRoute(useAuth);

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>protected content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByText('protected content')).toBeInTheDocument();
    });

    it('renders default loading text when loading', () => {
      const useAuth = () => ({
        currentUser: null as TestUser | null,
        loading: true,
      });
      const ProtectedRoute = createProtectedRoute(useAuth);

      render(
        <MemoryRouter>
          <ProtectedRoute>
            <div>protected content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    });

    it('renders custom loader component when loading', () => {
      const useAuth = () => ({
        currentUser: null as TestUser | null,
        loading: true,
      });
      const ProtectedRoute = createProtectedRoute(useAuth);

      function CustomLoader() {
        return <div>Custom Loading</div>;
      }

      render(
        <MemoryRouter>
          <ProtectedRoute loader={CustomLoader}>
            <div>protected content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.getByText('Custom Loading')).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('redirects to /login by default when not authenticated', () => {
      const useAuth = () => ({
        currentUser: null as TestUser | null,
        loading: false,
      });
      const ProtectedRoute = createProtectedRoute(useAuth);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute>
            <div>protected content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    });

    it('redirects to custom path when specified', () => {
      const useAuth = () => ({
        currentUser: null as TestUser | null,
        loading: false,
      });
      const ProtectedRoute = createProtectedRoute(useAuth);

      render(
        <MemoryRouter initialEntries={['/dashboard']}>
          <ProtectedRoute redirectTo="/signin">
            <div>protected content</div>
          </ProtectedRoute>
        </MemoryRouter>,
      );

      expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    });
  });
});
