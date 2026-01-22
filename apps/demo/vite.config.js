import react from '@vitejs/plugin-react';
import { mergeConfig } from 'vite';
import baseConfig from '../../vitest.config.base';

export default mergeConfig(baseConfig, {
  plugins: [
    react({
      babel: {
        plugins: ['babel-plugin-react-compiler'],
      },
    }),
  ],
  test: {
    coverage: {
      exclude: [
        // Node_modules
        'node_modules/**',
        // Test files
        '**/*.test.{ts,tsx}',
        '**/*.spec.{ts,tsx}',
        // Type definitions
        '**/*.d.ts',
        // Build artifacts
        'dist/**',
        // Barrel files (re-exports only)
        'src/index.ts',
        'src/hooks/index.ts',
        'src/utils/index.ts',
        // Mocks and fixtures
        '**/{mocks,fixtures,__mocks__}/**',
        // Configuration files
        '**/{vitest,vitest.config.base,vitest.config}.{ts,js}',
      ],
    },
  },
});
