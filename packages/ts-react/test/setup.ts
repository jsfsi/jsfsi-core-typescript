import '@testing-library/jest-dom';
import * as matchers from '@testing-library/jest-dom/matchers';
import { vi, afterEach, expect } from 'vitest';

import './mocks/firebase';
import './mocks/local-storage';
import './mocks/match-media';

// Extend Vitest's expect with jest-dom matchers
expect.extend(matchers);

// Clean up after each test
afterEach(() => {
  window.localStorage.clear();
  vi.clearAllMocks();
});
