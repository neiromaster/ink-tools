# Vitest Configuration Guide for Monorepos

This guide provides comprehensive documentation for configuring Vitest in pnpm monorepos, preventing common module resolution issues, and establishing best practices for testing workflows.

## Table of Contents

1. [Understanding the Problem](#understanding-the-problem)
2. [Prevention Strategies](#prevention-strategies)
3. [Best Practices](#best-practices)
4. [Testing Checklist](#testing-checklist)
5. [Common Pitfalls](#common-pitfalls)
6. [Configuration Templates](#configuration-templates)
7. [Troubleshooting Guide](#troubleshooting-guide)

---

## Understanding the Problem

### Why Root Config Isn't Enough

When running tests via `pnpm -r` (recursive workspace execution), each package executes Vitest from its own directory context. This creates several challenges:

1. **Workspace Resolution**: Package-specific workspace dependencies (`workspace:*`) must be resolved correctly
2. **Module Exports**: Complex `package.json` exports fields need proper resolution conditions
3. **Build Artifacts**: Tests must resolve to `dist/` directories, not source files
4. **Type Conditions**: ESM/CJS dual packages require explicit condition ordering

### The Vitest Module Resolution Issue

**Symptom**: Tests fail with module resolution errors when run via `pnpm -r test` but work when run from individual package directories.

**Root Cause**: Vitest running from root doesn't apply proper resolution conditions for package workspace dependencies when executing in recursive mode.

**Solution**: Each package needs its own `vitest.config.ts` that extends a base configuration with package-specific resolution settings.

---

## Prevention Strategies

### Project Setup Documentation

#### Initial Monorepo Setup

When creating a new pnpm monorepo with Vitest:

1. **Create base configuration** (`vitest.config.base.ts` at root):

   ```ts
   import { defineConfig } from 'vitest/config';

   export default defineConfig({
     test: {
       environment: 'node',
       globals: false,
     },
     resolve: {
       conditions: ['development', 'import', 'require', 'node', 'default'],
       mainFields: ['module', 'main'],
     },
   });
   ```

2. **Create root Vitest config** (`vitest.config.ts`):

   ```ts
   import { mergeConfig } from 'vitest/config';
   import baseConfig from './vitest.config.base';

   export default mergeConfig(baseConfig, {
     test: {
       coverage: {
         provider: 'v8',
         reporter: ['text', 'lcov'],
       },
     },
   });
   ```

3. **Add package-level configs** for each package:

   ```ts
   // packages/package-name/vitest.config.ts
   import { mergeConfig } from 'vitest/config';
   import baseConfig from '../../vitest.config.base';

   export default mergeConfig(baseConfig, {
     // Package-specific overrides
   });
   ```

4. **Update package.json scripts**:

   ```json
   {
     "scripts": {
       "test": "pnpm -r --filter './packages/*' test",
       "test:coverage": "vitest --coverage",
       "test:coverage:lcov": "vitest --coverage --coverage.reporter=lcov"
     }
   }
   ```

#### Essential Documentation Sections

Add these sections to your `CONTRIBUTING.md` or `CLAUDE.md`:

##### Package Testing Requirements

```markdown
## Testing Requirements

### Adding a New Package

When adding a new package to the monorepo:

1. Create `vitest.config.ts` in the package directory
2. Extend the base configuration from `../../vitest.config.base`
3. Add `test` script to package.json
4. Verify tests run via `pnpm -r test`

Example:
\`\`\`ts
// packages/new-package/vitest.config.ts
import { mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base';

export default mergeConfig(baseConfig, {});
\`\`\`
```

##### Module Resolution Configuration

```markdown
## Module Resolution

### Vitest Configuration

All packages must extend the base Vitest configuration to ensure proper module resolution in the monorepo:

- **Base config**: `vitest.config.base.ts` (root)
- **Root config**: `vitest.config.ts` (root)
- **Package configs**: `vitest.config.ts` (each package)

### Resolution Conditions

The base configuration includes these resolution conditions:
- `development` - Dev-mode specific exports
- `import` - ESM imports
- `require` - CJS imports
- `node` - Node.js resolution
- `default` - Fallback exports

These ensure workspace dependencies resolve correctly in dual-package (ESM/CJS) setups.
```

### CI Workflow Checks

#### Pre-Merge Validation

Add these checks to your CI workflow before running tests:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  validate-vitest-configs:
    name: Validate Vitest Configurations
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 20
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build packages
        run: pnpm run build

      - name: Verify vitest configs exist
        run: |
          ! find packages -name "package.json" -type f \
            | while read pkg; do
              dir=$(dirname "$pkg")
              if [ ! -f "$dir/vitest.config.ts" ]; then
                echo "Missing vitest.config.ts in $dir"
                exit 1
              fi
            done

      - name: Test module resolution
        run: pnpm -r --filter './packages/*' test --run

  test:
    needs: validate-vitest-configs
    # ... rest of test job
```

#### Module Resolution Smoke Test

Add a dedicated validation step:

```yaml
- name: Verify module resolution
  run: |
    # Test that workspace dependencies resolve correctly
    pnpm --filter '@ink-tools/ink-mouse' exec node -e \
      "console.log(require.resolve('xterm-mouse'))"
```

### Template Configurations

#### Package Template

Create a `templates/package/` directory with these files:

```
templates/package/
├── package.json.template
├── vitest.config.ts
├── tsconfig.json
└── README.md
```

**vitest.config.ts template**:

```ts
import { mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base';

/**
 * Vitest configuration for {{PACKAGE_NAME}}
 *
 * Extends the base monorepo configuration with package-specific settings.
 *
 * @see ../vitest.config.base.ts
 */
export default mergeConfig(baseConfig, {
  test: {
    // Add package-specific test configuration here
    // Example: include/exclude patterns, coverage settings, etc.
  },
});
```

**package.json additions**:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

---

## Best Practices

### Vitest Config Structure in Monorepos

#### Three-Tier Configuration Pattern

```
repository/
├── vitest.config.base.ts      # Shared base configuration
├── vitest.config.ts           # Root-specific configuration
└── packages/
    ├── package-a/
    │   └── vitest.config.ts   # Extends base
    └── package-b/
        └── vitest.config.ts   # Extends base
```

#### Configuration Responsibilities

**Base Configuration** (`vitest.config.base.ts`):

- Resolution conditions for monorepo
- Environment settings (node, jsdom, etc.)
- Global test settings (timeouts, globals, etc.)
- Shared coverage defaults

**Root Configuration** (`vitest.config.ts`):

- Root-specific coverage settings
- CI/CD reporter configurations
- Monorepo-wide test patterns

**Package Configuration** (`packages/*/vitest.config.ts`):

- Package-specific includes/excludes
- Custom coverage thresholds
- Package-specific test environment
- Workspace dependency resolution overrides

### When to Use mergeConfig vs Standalone

#### Use mergeConfig When

- Extending shared configuration (most cases)
- Adding package-specific overrides
- Maintaining consistency across packages
- Reducing configuration duplication

**Example**:

```ts
import { mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base';

export default mergeConfig(baseConfig, {
  test: {
    include: ['src/**/*.test.ts'],
    coverage: {
      thresholds: { lines: 90 },
    },
  },
});
```

#### Use Standalone Config When

- Package has completely different requirements
- Testing in isolated environments (browser vs node)
- Experimental features not shared across packages
- External packages with independent release cycles

**Example**:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // Different from base
    browser: true, // Experimental feature
  },
});
```

### How to Test Module Resolution Locally

#### Pre-Push Verification Workflow

1. **Clean build**:

   ```bash
   pnpm clean   # If you have a clean script
   rm -rf packages/*/dist
   pnpm run build
   ```

2. **Test resolution from package directories**:

   ```bash
   cd packages/ink-mouse
   pnpm test
   cd ../..
   ```

3. **Test via recursive execution** (the critical test):

   ```bash
   pnpm -r --filter './packages/*' test
   ```

4. **Test workspace dependency resolution**:

   ```bash
   pnpm --filter '@ink-tools/ink-mouse' exec node -e \
     "console.log(require.resolve('xterm-mouse'))"
   ```

5. **Run coverage reports**:

   ```bash
   pnpm run test:coverage:lcov
   ```

#### Module Resolution Debugging

Enable Vitest's debug mode to see resolution paths:

```bash
# Debug mode for module resolution
DEBUG=vite:resolve pnpm test

# Verbose Vitest output
VITEST_VERBOSE=1 pnpm test

# Check what Vitest is actually resolving
pnpm vitest --debug
```

#### Verification Script

Create `scripts/verify-vitest-configs.js`:

```js
#!/usr/bin/env node
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

const packagesDir = 'packages';
const errors = [];

for (const pkg of readdirSync(packagesDir)) {
  const pkgDir = join(packagesDir, pkg);
  const vitestConfig = join(pkgDir, 'vitest.config.ts');

  if (!existsSync(vitestConfig)) {
    errors.push(`Missing vitest.config.ts in ${pkgDir}`);
    continue;
  }

  const content = readFileSync(vitestConfig, 'utf-8');

  // Verify it extends base config
  if (!content.includes("from '../../vitest.config.base'")) {
    errors.push(`${vitestConfig} doesn't extend base config`);
  }

  // Verify it uses mergeConfig
  if (!content.includes('mergeConfig')) {
    errors.push(`${vitestConfig} should use mergeConfig`);
  }
}

if (errors.length > 0) {
  console.error('Vitest config validation failed:');
  errors.forEach(err => console.error(`  - ${err}`));
  process.exit(1);
}

console.log('All vitest configs are valid!');
```

Add to `package.json`:

```json
{
  "scripts": {
    "verify:configs": "node scripts/verify-vitest-configs.js"
  }
}
```

---

## Testing Checklist

### Pre-Commit Checks

#### Before Committing Code

- [ ] Run tests from package directory: `cd packages/my-package && pnpm test`
- [ ] Run tests via recursive execution: `pnpm -r --filter './packages/*' test`
- [ ] Verify workspace dependencies resolve: `pnpm --filter './packages/*' exec node -e "console.log(require.resolve('workspace-dep'))"`
- [ ] Check for new packages without `vitest.config.ts`
- [ ] Run typecheck: `pnpm run typecheck`
- [ ] Run build: `pnpm run build`

#### Automated Pre-Commit Hook

Add to `.lefthook.yml`:

```yaml
pre-commit:
  parallel: true
  commands:
    vitest-configs:
      run: pnpm verify:configs
      stage_fixed: true

    package-tests:
      run: pnpm -r --filter './packages/*' test --run
      stage_fixed: true
```

### CI Workflow Validation Steps

#### Pull Request Checklist

- [ ] All tests pass across all Node.js versions (20, 22, 24)
- [ ] Coverage reports generate successfully
- [ ] No module resolution errors in logs
- [ ] Workspace dependencies resolve correctly
- [ ] Type checking passes
- [ ] Linting passes

#### CI Job Sequence

```yaml
jobs:
  # 1. Validate configurations
  validate-configs:
    name: Validate Configurations
    runs-on: ubuntu-latest
    steps:
      - name: Verify vitest configs
        run: pnpm verify:configs

  # 2. Build packages
  build:
    needs: validate-configs
    name: Build Packages
    runs-on: ubuntu-latest
    steps:
      - name: Build all packages
        run: pnpm run build

  # 3. Type check
  typecheck:
    needs: build
    name: Type Check
    runs-on: ubuntu-latest
    steps:
      - name: Run typecheck
        run: pnpm run typecheck

  # 4. Lint
  lint:
    needs: build
    name: Lint Check
    runs-on: ubuntu-latest
    steps:
      - name: Run lint
        run: pnpm run check

  # 5. Test
  test:
    needs: [build, typecheck, lint]
    name: Test (Node ${{ matrix.node-version }})
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [20, 22, 24]
    steps:
      - name: Run tests
        run: pnpm test

      - name: Generate coverage
        run: pnpm run test:coverage:lcov
```

### Local Testing Commands

#### Quick Tests

```bash
# Fast feedback loop (no coverage)
pnpm -r --filter './packages/*' test --run

# Watch mode for development
pnpm -r --filter './packages/*' test --watch

# Single package tests
pnpm --filter '@ink-tools/ink-mouse' test
```

#### Comprehensive Tests

```bash
# Full test suite with coverage
pnpm run test:coverage:reporters

# Tests for all packages in parallel
pnpm -r --filter './packages/*' test --parallel --reporter=verbose

# Tests with debug output
DEBUG=vite:* pnpm test
```

#### Module Resolution Tests

```bash
# Verify workspace dependency resolution
pnpm --filter '@ink-tools/ink-mouse' exec node -e \
  "import('xterm-mouse').then(m => console.log('Resolved:', m))"

# Check that all packages have vitest configs
find packages -name "package.json" -type f \
  | while read pkg; do
      dir=$(dirname "$pkg")
      [ ! -f "$dir/vitest.config.ts" ] && echo "Missing: $dir/vitest.config.ts"
    done
```

---

## Common Pitfalls

### Why Root Config Isn't Enough

#### The Problem

```ts
// Root vitest.config.ts only
export default defineConfig({
  test: {
    environment: 'node',
  },
});
```

When running `pnpm -r test`, Vitest executes from each package directory. The root config isn't automatically discovered or applied.

**Symptoms**:

- Default resolution conditions don't match workspace needs
- Module exports not resolved correctly
- Inconsistent test environments across packages

#### The Solution

Each package must have its own config extending the base:

```ts
// packages/*/vitest.config.ts
import { mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base';

export default mergeConfig(baseConfig, {});
```

### Detecting Module Resolution Issues Early

#### Warning Signs

1. **Tests pass locally but fail in CI**
   - Often indicates workspace dependency resolution issue
   - Check that `pnpm -r test` works locally

2. **Error: "Cannot find module 'workspace-dep'"**
   - Vitest not resolving workspace dependencies correctly
   - Missing resolution conditions in config

3. **Different behavior between `pnpm test` and `cd pkg && pnpm test`**
   - Config inheritance issue
   - Package missing vitest.config.ts

4. **Type errors in tests but not in source**
   - TypeScript not using correct module resolution
   - Check tsconfig.json and vitest.config.ts alignment

#### Detection Script

Create `scripts/detect-vitest-issues.sh`:

```bash
#!/bin/bash
set -e

echo "Checking for common Vitest issues..."

# 1. Check for packages without vitest configs
echo "1. Checking for missing vitest.config.ts files..."
missing=$(find packages -name "package.json" -type f | while read pkg; do
  dir=$(dirname "$pkg")
  if [ ! -f "$dir/vitest.config.ts" ]; then
    echo "$dir"
  fi
done)

if [ -n "$missing" ]; then
  echo "ERROR: Missing vitest.config.ts in:"
  echo "$missing"
  exit 1
fi

# 2. Check if packages extend base config
echo "2. Checking if packages extend base config..."
find packages -name "vitest.config.ts" | while read config; do
  if ! grep -q "from '../../vitest.config.base'" "$config"; then
    echo "WARNING: $config doesn't extend base config"
  fi
done

# 3. Test workspace dependency resolution
echo "3. Testing workspace dependency resolution..."
if ! pnpm --filter './packages/*' exec node -e "process.exit(0)" 2>/dev/null; then
  echo "ERROR: Workspace dependency resolution failed"
  exit 1
fi

echo "All checks passed!"
```

### Error Messages That Indicate Vitest Config Problems

#### Module Resolution Errors

```
Error: Cannot find module 'xterm-mouse'
Require stack:
- /path/to/packages/ink-mouse/src/index.test.ts
```

**Cause**: Missing or incorrect resolution conditions

**Fix**: Ensure base config has proper `resolve.conditions`

#### Export Errors

```
Error: No known conditions for "./dist/index.js" in "xterm-mouse" package
```

**Cause**: Vitest not using correct export conditions

**Fix**: Add conditions: `['development', 'import', 'require', 'node', 'default']`

#### Workspace Dependency Errors

```
Error: Cannot find package 'workspace:*' imported from ...
```

**Cause**: pnpm workspace protocol not resolved

**Fix**: Ensure packages are built before testing, verify workspace: dependencies

#### Type Errors in Tests

```
TS2307: Cannot find module 'xterm-mouse' or its corresponding type declarations
```

**Cause**: TypeScript using different resolution than Vitest

**Fix**: Align tsconfig.json `moduleResolution` with Vitest config

#### Build Artifact Resolution

```
Error: Cannot find module './src/index' (imported by ...)
```

**Cause**: Tests trying to import from source instead of dist

**Fix**: Ensure package.json exports point to dist/, not src/

### Testing in Isolation vs Recursive Execution

#### Isolated Testing (Works)

```bash
cd packages/ink-mouse
pnpm test
# ✓ Works because vitest.config.ts is in current directory
```

#### Recursive Testing (Fails without proper config)

```bash
pnpm -r --filter './packages/*' test
# ✗ Fails if packages don't have their own vitest.config.ts
```

**Why**: Vitest discovers config from current working directory. Without package-level configs, each package runs with default settings that don't include monorepo-specific resolution.

---

## Configuration Templates

### Complete Template Set

#### Base Configuration Template

**File**: `vitest.config.base.ts`

```ts
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
    include: ['**/*.test.ts', '**/*.test.tsx'],
    exclude: ['**/node_modules/**', '**/dist/**'],
  },

  // Resolve configuration for monorepo workspace packages
  // This ensures vitest can properly resolve package.json exports
  // in pnpm workspace monorepos
  resolve: {
    conditions: ['development', 'import', 'require', 'node', 'default'],
    mainFields: ['module', 'main'],
  },
});
```

#### Root Configuration Template

**File**: `vitest.config.ts`

```ts
import { mergeConfig } from 'vitest/config';
import baseConfig from './vitest.config.base';

/**
 * Root Vitest configuration
 *
 * Extends the base configuration with root-specific settings for
 * coverage reporting and CI/CD integration.
 */
export default mergeConfig(baseConfig, {
  test: {
    // Coverage configuration
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
      // Threshold: 80% for lines and functions
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
```

#### Package Configuration Template

**File**: `packages/package-name/vitest.config.ts`

```ts
import { mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base';

/**
 * Vitest configuration for @scope/package-name
 *
 * Extends the base monorepo configuration with package-specific settings.
 *
 * @see ../../vitest.config.base.ts
 */
export default mergeConfig(baseConfig, {
  test: {
    // Package-specific settings can be added here
    // Examples:
    //
    // - Custom include patterns:
    //   include: ['src/**/*.test.ts'],
    //
    // - Coverage overrides:
    //   coverage: {
    //     thresholds: { lines: 90 },
    //   },
    //
    // - Test timeout for slow tests:
    //   testTimeout: 10000,
  },
});
```

### Package.json Additions Template

Add to each package's `package.json`:

```json
{
  "name": "@scope/package-name",
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/coverage-v8": "^1.0.0"
  }
}
```

---

## Troubleshooting Guide

### Diagnostic Commands

#### Check Configuration Loading

```bash
# Run Vitest in debug mode to see config loading
pnpm vitest --debug

# Check which config file Vitest is using
pnpm vitest --show-config
```

#### Verify Module Resolution

```bash
# Check resolution paths
DEBUG=vite:resolve pnpm test

# Test module resolution directly
node -e "console.log(require.resolve('package-name'))"
```

#### Inspect Workspace Dependencies

```bash
# List all workspace dependencies
pnpm list --depth 0

# Check specific package workspace dependencies
pnpm --filter '@scope/package-name' why xterm-mouse

# Verify workspace protocol resolution
pnpm install --force
```

### Common Issues and Solutions

#### Issue: Tests Pass in Package Dir but Fail via pnpm -r

**Symptoms**:

```bash
cd packages/ink-mouse && pnpm test  # ✓ Works
pnpm -r --filter './packages/*' test # ✗ Fails
```

**Diagnosis**:

```bash
# Check if vitest.config.ts exists
ls -la packages/*/vitest.config.ts

# Check if it extends base config
grep "from '../../vitest.config.base'" packages/*/vitest.config.ts
```

**Solution**:
Create or update `vitest.config.ts` in each package to extend base config.

#### Issue: Workspace Dependency Not Found

**Symptoms**:

```
Error: Cannot find module 'workspace-dep'
```

**Diagnosis**:

```bash
# Check if dependency is built
ls -la packages/workspace-dep/dist/

# Check package.json exports
cat packages/workspace-dep/package.json | grep -A 10 '"exports"'
```

**Solution**:

1. Build workspace dependencies first: `pnpm run build`
2. Verify package.json exports point to `dist/`, not `src/`
3. Check workspace: dependency protocol in package.json

#### Issue: Type Errors Only in Tests

**Symptoms**:

```
TS2307: Cannot find module 'xterm-mouse' or its corresponding type declarations
```

**Diagnosis**:

```bash
# Check tsconfig.json
cat packages/ink-mouse/tsconfig.json | grep -A 5 '"compilerOptions"'

# Verify types field in package.json
cat packages/xterm-mouse/package.json | grep '"types"'
```

**Solution**:
Ensure package.json has correct types field:

```json
{
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts"
    }
  }
}
```

#### Issue: Coverage Not Generated

**Symptoms**:

```bash
pnpm test:coverage
# No coverage output
```

**Diagnosis**:

```bash
# Check if coverage provider installed
pnpm list @vitest/coverage-v8

# Check vitest config for coverage settings
grep -A 20 '"coverage"' vitest.config.ts
```

**Solution**:

1. Install coverage provider: `pnpm add -D @vitest/coverage-v8`
2. Add coverage config to vitest.config.ts
3. Use `--coverage` flag when running tests

### Getting Help

When troubleshooting, gather this information:

```bash
# 1. Environment info
pnpm env list
node --version
pnpm --version

# 2. Vitest info
pnpm vitest --version

# 3. Configuration
find packages -name "vitest.config.ts" | head -5

# 4. Error reproduction
pnpm -r --filter './packages/*' test 2>&1 | tee test-error.log

# 5. Debug output
DEBUG=vite:* pnpm test 2>&1 | tee debug.log
```

Create a GitHub issue with:

- Error messages
- Vitest configuration files
- Package structure
- Steps to reproduce
- Debug logs

---

## Additional Resources

### Official Documentation

- [Vitest Configuration](https://vitest.dev/config/)
- [pnpm Workspace](https://pnpm.io/workspaces)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/modules/reference.html)
- [Node.js Package Exports](https://nodejs.org/api/packages.html#exports)

### Related Tools

- [tsup](https://tsup.egoist.dev/) - Bundle TypeScript packages
- [Changesets](https://github.com/changesets/changesets) - Version monorepo packages
- [Biome](https://biomejs.dev/) - Linting and formatting

### Example Repositories

- [Vitest Monorepo Example](https://github.com/vitest-dev/vitest)
- [pnpm Workspace Examples](https://github.com/pnpm/pnpm/tree/main/examples)
- [Ink Repository](https://github.com/vadimdemedes/ink)

---

## Contributing

When adding to this guide:

1. Keep examples runnable and tested
2. Include both problem and solution
3. Provide copy-pasteable configurations
4. Link to related documentation
5. Update the table of contents

### Review Checklist

- [ ] Code examples are accurate
- [ ] Commands are tested
- [ ] Links work
- [ ] Sections are logically ordered
- [ ] Table of contents is updated
