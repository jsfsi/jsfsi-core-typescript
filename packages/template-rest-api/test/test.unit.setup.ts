import { vi } from 'vitest';
import './test.setup';

vi.mock('typeorm', async (importOriginal) => ({
  ...(await importOriginal()),
  DataSource: vi.fn().mockImplementation(function () {
    return {
      initialize: vi.fn(),
    };
  }),
}));
