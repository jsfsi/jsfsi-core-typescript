import react from '@vitejs/plugin-react';
import { defineConfig } from 'vitest/config';

const shadcnComponents = [
  'avatar',
  'button',
  'dialog',
  'dropdown-menu',
  'fullscreen-loader',
  'input',
  'label',
  'separator',
  'sheet',
  'sidebar',
  'skeleton',
  'sonner',
  'tooltip',
  'utils',
];

const shadcnHooks = ['use-mobile'];

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    css: true,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['**/src/**/*.{ts,tsx}'],
      exclude: [
        'src/ui/index.tsx',
        '**/*.d.ts',
        'src/ui/theme/**',
        'src/ui/i18n/**',
        'src/domain/models/**',
        'src/ui/components/auth/**',
        'src/ConfigurationService.ts',
        'src/ui/components/form/**',
        // Shadcn components
        ...shadcnComponents.map((component) => `src/ui/components/${component}.tsx`),
        ...shadcnHooks.map((hook) => `src/ui/hooks/${hook}.ts`),
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
