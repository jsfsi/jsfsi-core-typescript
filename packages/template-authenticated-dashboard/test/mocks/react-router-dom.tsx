import { vi } from 'vitest';

vi.mock(import('react-router-dom'), async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
  };
});
