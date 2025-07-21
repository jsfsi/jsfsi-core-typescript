import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { App } from './App';

vi.mock('../pages/login/LoginPage', () => ({
  LoginPage: () => <div>Login Page</div>,
}));

describe('App', () => {
  describe('render', () => {
    it('renders non authenticated app', () => {
      const { getByText } = render(<App />);

      expect(getByText('Login Page')).toBeInTheDocument();
    });
  });
});
