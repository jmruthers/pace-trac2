import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { domInclude, resolveAlias, sharedTestOptions, paceCoreSvgMockPlugin } from './vitest.shared.js';

export default defineConfig({
  configLoader: 'runner',
  plugins: [react(), paceCoreSvgMockPlugin()],
  ssr: {
    noExternal: ['@solvera/pace-core'],
  },
  resolve: {
    alias: resolveAlias,
  },
  test: {
    ...sharedTestOptions,
    environment: 'happy-dom',
    setupFiles: ['./src/test-setup.ts'],
    include: domInclude,
  },
});
