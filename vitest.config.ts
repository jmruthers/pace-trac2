import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';
import { domInclude, resolveAlias, sharedTestOptions } from './vitest.shared.js';

const domEnvironmentGlobs = domInclude.map((pattern) => [pattern, 'happy-dom'] as [string, string]);

export default defineConfig({
  plugins: [react()],
  test: {
    ...sharedTestOptions,
    testTimeout: 10000,
    hookTimeout: 10000,
    teardownTimeout: 5000,
    environment: 'node',
    environmentMatchGlobs: domEnvironmentGlobs,
    setupFiles: ['./src/test-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text'],
      include: [
        'src/app-config.ts',
        'src/app/navigation/**/*.ts',
        'src/app/pages/**/*.tsx',
        'src/app/shell/**/*.tsx',
        'src/app/routes/**/*.ts',
        'src/features/contacts/**/*.{ts,tsx}',
        'src/features/planning/**/*.ts',
        'src/hooks/journal/**/*.ts',
        'src/components/journal/**/*.tsx',
        'src/utils/journal-*.ts',
      ],
      exclude: [
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.integration.test.ts',
        '**/*.integration.test.tsx',
        '**/types.ts',
        '**/index.ts',
        '**/dist/**',
        '**/coverage/**',
        '**/node_modules/**',
      ],
      thresholds: {
        'src/app-config.ts': { statements: 100, lines: 100 },
        'src/app/navigation/**/*.ts': { statements: 85, lines: 85 },
        'src/app/pages/**/*.tsx': { statements: 70, lines: 70 },
        'src/hooks/journal/**/*.ts': { statements: 70, lines: 70 },
        'src/components/journal/**/*.tsx': { statements: 70, lines: 70 },
        'src/utils/journal-*.ts': { statements: 85, lines: 85 },
        'src/app/shell/**/*.tsx': { statements: 70, lines: 70 },
        'src/app/routes/**/*.ts': { statements: 85, lines: 85 },
        'src/features/contacts/**/*.{ts,tsx}': { statements: 70, lines: 70 },
      },
    },
  },
  resolve: {
    alias: {
      ...resolveAlias,
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-dom': path.resolve(__dirname, 'node_modules/react-dom'),
    },
    dedupe: ['react', 'react-dom', 'react-router-dom'],
  },
});
