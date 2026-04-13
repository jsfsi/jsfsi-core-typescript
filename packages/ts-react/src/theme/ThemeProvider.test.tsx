import { render, screen, act } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ThemeProvider, useTheme } from './ThemeProvider';

function ThemeConsumer() {
  const { theme, setTheme } = useTheme();
  return (
    <div>
      <span>theme: {theme}</span>
      <button onClick={() => setTheme('dark')}>Set Dark</button>
      <button onClick={() => setTheme('light')}>Set Light</button>
    </div>
  );
}

describe('ThemeProvider', () => {
  describe('Render', () => {
    it('uses system as default theme', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByText('theme: system')).toBeInTheDocument();
    });

    it('uses provided default theme', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByText('theme: dark')).toBeInTheDocument();
    });

    it('reads theme from localStorage when available', () => {
      window.localStorage.setItem('vite-ui-theme', 'light');

      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByText('theme: light')).toBeInTheDocument();
    });

    it('uses custom storage key', () => {
      window.localStorage.setItem('custom-key', 'dark');

      render(
        <ThemeProvider storageKey="custom-key">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(screen.getByText('theme: dark')).toBeInTheDocument();
    });
  });

  describe('Behavior', () => {
    it('updates theme and persists to localStorage', () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>,
      );

      act(() => {
        screen.getByText('Set Dark').click();
      });

      expect(screen.getByText('theme: dark')).toBeInTheDocument();
      expect(window.localStorage.getItem('vite-ui-theme')).toBe('dark');
    });

    it('applies theme class to document root', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('applies light system theme class when matchMedia prefers light', () => {
      render(
        <ThemeProvider defaultTheme="system">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains('light')).toBe(true);
    });

    it('applies dark system theme class when matchMedia prefers dark', () => {
      vi.mocked(window.matchMedia).mockImplementation((query) => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      render(
        <ThemeProvider defaultTheme="system">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains('dark')).toBe(true);
    });

    it('removes previous theme class when switching', () => {
      render(
        <ThemeProvider defaultTheme="dark">
          <ThemeConsumer />
        </ThemeProvider>,
      );

      expect(document.documentElement.classList.contains('dark')).toBe(true);

      act(() => {
        screen.getByText('Set Light').click();
      });

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(document.documentElement.classList.contains('light')).toBe(true);
    });
  });
});
