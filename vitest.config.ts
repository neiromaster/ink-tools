import { mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.base';

export default mergeConfig(baseConfig, {
  test: {
    // Coverage configuration (migrated from bunfig.toml)
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'json'],
      exclude: [
        // Test files
        '**/*.test.ts',
        '**/*.test.tsx',
        '**/*.spec.ts',
        '**/*.spec.tsx',
        // Build artifacts and generated files
        'dist/**',
        'build/**',
        '*.d.ts',
        '*.d.ts.map',
        // Configuration files
        '*.config.ts',
        '*.config.js',
        '*.config.json',
        'tsconfig.json',
        // Mock and test utilities
        '**/mocks/**',
        '**/__mocks__/**',
        '**/fixtures/**',
        '**/__tests__/**',
        // Documentation and examples
        '**/examples/**',
        '**/docs/**',
        // Type definition files
        '**/*.d.ts',
        // Node modules
        'node_modules/**',
      ],
      // Threshold: 80% for lines and functions (from bunfig.toml)
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 80,
        statements: 80,
      },
      // Per-package coverage reports
      reportsDirectory: './coverage',
    },
  },
});
