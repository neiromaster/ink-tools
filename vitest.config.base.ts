import { defineConfig } from 'vitest/config';

/**
 * Base Vitest configuration for the monorepo
 *
 * This file contains shared Vitest settings used across all packages.
 * Both root and package vitest configs extend this base configuration.
 *
 * Key settings:
 * - Node environment for terminal testing
 * - Explicit imports (no globals)
 * - Monorepo workspace resolution for pnpm
 */
export default defineConfig({
  test: {
    environment: 'node',
    globals: false,
    testTimeout: 5000,
  },

  // Resolve configuration for monorepo workspace packages
  // This ensures vitest can properly resolve package.json exports
  // in pnpm workspace monorepos
  resolve: {
    conditions: ['development', 'import', 'require', 'node', 'default'],
    mainFields: ['module', 'main'],
  },
});
