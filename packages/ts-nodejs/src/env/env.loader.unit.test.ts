import { describe, expect, it } from 'vitest';

import { loadEnvConfig } from './env.loader';

describe('env', () => {
  describe('loadEnvConfig', () => {
    it('loads env config', () => {
      const envConfig = loadEnvConfig({
        env: 'test',
        configPath: '.',
      });

      expect(envConfig).toEqual({
        foo: 'bar',
      });
    });

    it('loads default config', () => {
      const envConfig = loadEnvConfig({
        configPath: '.',
      });

      expect(envConfig).toEqual({
        some: 'example',
      });
    });

    it('loads default config', () => {
      const envConfig = loadEnvConfig();

      expect(envConfig).toEqual({
        some: 'example',
      });
    });
  });
});
