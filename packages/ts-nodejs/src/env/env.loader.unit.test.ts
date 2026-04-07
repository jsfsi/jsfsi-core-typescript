import path from 'path';

import { afterEach, describe, expect, it, vi } from 'vitest';

import { loadEnvConfig } from './env.loader';

describe('env', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('loadEnvConfig', () => {
    it('loads env config', () => {
      const envConfig = loadEnvConfig({
        env: 'test',
        configPath: './src/env',
      });

      expect(envConfig).toEqual({
        foo: 'bar',
      });
    });

    it('loads default config', () => {
      const envConfig = loadEnvConfig({
        configPath: './src/env',
      });

      expect(envConfig).toEqual({
        some: 'example',
      });
    });

    it('falls back to process.cwd() when no configPath is provided', () => {
      vi.spyOn(process, 'cwd').mockReturnValue(path.resolve('./src/env'));

      const envConfig = loadEnvConfig();

      expect(envConfig).toEqual({
        some: 'example',
      });
    });
  });
});
