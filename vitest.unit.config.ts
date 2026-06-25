import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { resolveAlias, sharedTestOptions, unitExclude, unitInclude, paceCoreSvgMockPlugin } from './vitest.shared.js';

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
    environment: 'node',
    setupFiles: ['./src/test-setup-unit.ts'],
    include: unitInclude,
    exclude: unitExclude,
  },
});
