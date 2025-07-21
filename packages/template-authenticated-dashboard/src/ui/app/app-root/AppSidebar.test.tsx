import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { SidebarProvider } from '../../components/sidebar';

import { AppSidebar } from './AppSidebar';

// Mock the toggle components
vi.mock('../../components/language-toggle/LanguageToggle', () => ({
  LanguageToggle: () => <div>Language Toggle</div>,
}));

vi.mock('../../components/theme-toggle/ThemeToggle', () => ({
  ThemeToggle: () => <div>Theme Toggle</div>,
}));

// Mock the AppUser component
vi.mock('./AppUser', () => ({
  AppUser: () => <div>App User</div>,
}));

describe('AppSidebar', () => {
  describe('render', () => {
    it('displays language and theme toggles in header', () => {
      const { getByText } = render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>,
      );

      expect(getByText('Language Toggle')).toBeInTheDocument();
      expect(getByText('Theme Toggle')).toBeInTheDocument();
    });

    it('displays app user in footer', () => {
      const { getByText } = render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>,
      );

      expect(getByText('App User')).toBeInTheDocument();
    });
  });
});
