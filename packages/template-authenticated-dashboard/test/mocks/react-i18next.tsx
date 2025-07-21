import { vi } from 'vitest';

// Use vi.importActual instead of requireActual
const i18next = await vi.importActual('react-i18next');

vi.mock('react-i18next', () => ({
  ...i18next,
  I18nextProvider: ({ children }) => (
    <>
      <div>I18nextProvider</div>
      {children}
    </>
  ),
}));
