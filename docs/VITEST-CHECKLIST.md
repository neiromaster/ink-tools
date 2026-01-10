# Vitest Configuration Quick Checklist

A quick-reference checklist for Vitest configuration in pnpm monorepos. See [VITEST-CONFIG-GUIDE.md](./VITEST-CONFIG-GUIDE.md) for detailed documentation.

## New Package Setup

### Required Files

- [ ] `vitest.config.base.ts` at repository root
- [ ] `vitest.config.ts` at repository root
- [ ] `vitest.config.ts` in package directory
- [ ] `package.json` with test scripts

### Configuration Validation

- [ ] Package config extends base config: `import baseConfig from '../../vitest.config.base'`
- [ ] Uses `mergeConfig` from vitest/config
- [ ] Includes resolution conditions: `['development', 'import', 'require', 'node', 'default']`
- [ ] Has test scripts in package.json: `test`, `test:watch`, `test:coverage`

### Local Testing

Before pushing, run these commands:

```bash
# 1. Build all packages
pnpm run build

# 2. Test from package directory
cd packages/your-package && pnpm test

# 3. Test via recursive execution (critical!)
cd ../..
pnpm -r --filter './packages/*' test

# 4. Verify workspace dependency resolution
pnpm --filter '@scope/your-package' exec node -e \
  "console.log(require.resolve('workspace-dep'))"

# 5. Run typecheck
pnpm run typecheck
```

## Pre-Commit Checklist

### Code Quality

- [ ] Tests pass locally
- [ ] Typecheck passes: `pnpm run typecheck`
- [ ] Linting passes: `pnpm run check`
- [ ] Formatting applied: `pnpm run format`

### Vitest Configuration

- [ ] No new packages without `vitest.config.ts`
- [ ] All package configs extend base config
- [ ] `pnpm -r test` passes
- [ ] Workspace dependencies resolve correctly

## CI/CD Validation

### Workflow Checks

Your CI workflow should include these steps in order:

1. **Validate Configs**

   ```yaml
   - Verify vitest.config.ts exists in all packages
   - Verify configs extend base config
   ```

2. **Build**

   ```yaml
   - pnpm run build
   ```

3. **Type Check**

   ```yaml
   - pnpm run typecheck
   ```

4. **Lint**

   ```yaml
   - pnpm run check
   ```

5. **Test**

   ```yaml
   - pnpm -r --filter './packages/*' test
   - pnpm run test:coverage:lcov
   ```

## Module Resolution Checks

### Warning Signs

Watch out for these issues:

- Tests pass in package dir but fail via `pnpm -r`
- Error: "Cannot find module 'workspace-dep'"
- Error: "No known conditions for export"
- Different behavior between `pnpm test` and `cd pkg && pnpm test`
- Type errors in tests but not in source

### Detection Commands

```bash
# Find packages without vitest configs
find packages -name "package.json" -type f | while read pkg; do
  dir=$(dirname "$pkg")
  [ ! -f "$dir/vitest.config.ts" ] && echo "Missing: $dir/vitest.config.ts"
done

# Check configs extend base
grep -r "from '../../vitest.config.base'" packages/*/vitest.config.ts

# Test workspace resolution
pnpm --filter './packages/*' exec node -e "process.exit(0)"
```

## Troubleshooting Quick Guide

### Issue: Tests Fail via pnpm -r

**Check**:

```bash
# Does package have vitest.config.ts?
ls packages/your-package/vitest.config.ts

# Does it extend base config?
grep "mergeConfig" packages/your-package/vitest.config.ts
```

**Fix**: Create or update `vitest.config.ts` to extend base config

### Issue: Cannot Find Module

**Check**:

```bash
# Is dependency built?
ls packages/dependency/dist/

# Are exports correct?
cat packages/dependency/package.json | grep -A 10 '"exports"'
```

**Fix**: Build dependencies, fix package.json exports

### Issue: Type Errors in Tests

**Check**:

```bash
# Are types configured?
cat package.json | grep '"types"'

# Is tsconfig aligned?
cat tsconfig.json | grep "moduleResolution"
```

**Fix**: Update package.json types field, align tsconfig

## Configuration Templates

### Package vitest.config.ts

```ts
import { mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base';

export default mergeConfig(baseConfig, {
  test: {
    // Package-specific settings
  },
});
```

### Package Scripts

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

## Common Mistakes to Avoid

### Don't

- Rely only on root vitest.config.ts
- Use standalone config without extending base
- Forget to build before testing
- Skip `pnpm -r test` validation
- Ignore type errors in tests

### Do

- Create vitest.config.ts in every package
- Extend base configuration with mergeConfig
- Build packages before running tests
- Test via both direct and recursive execution
- Fix type errors immediately

## Quick Reference Commands

### Development

```bash
# Watch mode
pnpm -r --filter './packages/*' test --watch

# Single package
pnpm --filter '@scope/package' test

# Debug mode
DEBUG=vite:resolve pnpm test
```

### Validation

```bash
# All configs valid
pnpm verify:configs

# Module resolution
pnpm --filter './packages/*' exec node -e "process.exit(0)"

# Workspace dependencies
pnpm list --depth 0
```

### Coverage

```bash
# Text output
pnpm run test:coverage

# LCOV for CI
pnpm run test:coverage:lcov

# Both
pnpm run test:coverage:reporters
```

## Emergency Fix Template

If tests are failing in CI but passing locally, run this diagnostic:

```bash
# Full diagnostic
pnpm run build && \
pnpm run typecheck && \
pnpm -r --filter './packages/*' test --run && \
echo "All checks passed!"
```

If this fails, check:

1. All packages have vitest.config.ts
2. All configs extend base config
3. Workspace dependencies are built
4. package.json exports point to dist/

## Related Documentation

- [Complete Guide](./VITEST-CONFIG-GUIDE.md) - Detailed documentation
- [CLAUDE.md](../CLAUDE.md) - Project overview
- [Contributing Guide](../CONTRIBUTING.md) - Contribution guidelines

---

**Last Updated**: 2025-01-10
**Maintainer**: @neiromaster
