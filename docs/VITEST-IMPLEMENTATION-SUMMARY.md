# Vitest Configuration Implementation Summary

This document provides a concise summary of the Vitest module resolution issue and the solutions implemented in this monorepo.

## The Problem

When running tests via `pnpm -r test` in a pnpm workspace monorepo, Vitest executes from each package's directory context. Without proper configuration:

1. **Module resolution fails** - Workspace dependencies (`workspace:*`) don't resolve correctly
2. **Export conditions mismatch** - Package exports aren't found with default resolution
3. **Inconsistent behavior** - Tests pass in package directories but fail via recursive execution

### Root Cause

Vitest doesn't automatically inherit root configuration when running packages recursively. Each package needs its own configuration that extends a shared base with proper module resolution settings.

## The Solution

### Three-Tier Configuration Pattern

```
repository/
├── vitest.config.base.ts      # Shared base (resolution conditions)
├── vitest.config.ts           # Root-specific (coverage settings)
└── packages/
    ├── package-a/
    │   └── vitest.config.ts   # Extends base
    └── package-b/
        └── vitest.config.ts   # Extends base
```

### Key Implementation Details

1. **Base Configuration** (`vitest.config.base.ts`):
   - Sets resolution conditions: `['development', 'import', 'require', 'node', 'default']`
   - Configures test environment and globals
   - Shared across all packages

2. **Package Configuration** (each `packages/*/vitest.config.ts`):
   - Extends base config using `mergeConfig`
   - Can add package-specific overrides
   - Ensures consistent module resolution

3. **Root Configuration** (`vitest.config.ts`):
   - Extends base config
   - Adds monorepo-wide coverage settings
   - Configures CI/CD reporters

## Files Created/Modified

### Documentation

- `docs/VITEST-CONFIG-GUIDE.md` - Comprehensive guide (6000+ words)
- `docs/VITEST-CHECKLIST.md` - Quick reference checklist
- `docs/VITEST-IMPLEMENTATION-SUMMARY.md` - This file

### Scripts

- `scripts/verify-vitest-configs.js` - Validates all package configs
- `scripts/detect-vitest-issues.sh` - Detects common configuration issues

### Configuration

- `vitest.config.base.ts` - Base configuration with resolution conditions
- `vitest.config.ts` - Root configuration extending base
- `packages/*/vitest.config.ts` - Package-specific configs extending base

### CI/CD

- `.github/workflows/ci.yml` - Added `validate-vitest-configs` job
- `package.json` - Added `verify:configs` and `verify:tests` scripts

## How to Use

### For Developers

#### Adding a New Package

1. Create `vitest.config.ts` in the package directory:

```ts
import { mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base';

export default mergeConfig(baseConfig, {
  // Package-specific settings
});
```

1. Add test scripts to `package.json`:

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest watch",
    "test:coverage": "vitest run --coverage"
  }
}
```

1. Verify configuration:

```bash
pnpm verify:configs
```

#### Pre-Commit Checklist

Before pushing code:

```bash
# 1. Build packages
pnpm run build

# 2. Validate configurations
pnpm verify:configs
pnpm verify:tests

# 3. Run tests
pnpm -r --filter './packages/*' test

# 4. Type check
pnpm run typecheck
```

### For CI/CD

The workflow now includes:

1. **Validation Job** - Runs first, checks all configs
2. **Test Job** - Depends on validation, runs actual tests
3. **Multi-Version Testing** - Tests on Node 20, 22, 24

## Benefits

### Immediate Benefits

- **Consistent module resolution** across all packages
- **Early error detection** via validation scripts
- **Clear documentation** for future contributors
- **Automated checks** in CI pipeline

### Long-term Benefits

- **Prevent configuration drift** - All packages extend shared base
- **Easier onboarding** - Clear templates and guides
- **Reduced debugging time** - Issues caught before merge
- **Better test reliability** - Consistent behavior across environments

## Testing the Implementation

### Verification Commands

```bash
# Check all configs are valid
pnpm verify:configs

# Detect common issues
pnpm verify:tests

# Test module resolution
pnpm -r --filter './packages/*' test

# Test specific package
pnpm --filter '@ink-tools/ink-mouse' test
```

### Expected Output

```
✅ All vitest configs are valid!
✅ All checks passed!
✓ All packages have vitest.config.ts
✓ All packages extend base config
✓ Workspace dependencies resolve correctly
```

## Migration Path

### For Existing Monorepos

1. Create base configuration with resolution conditions
2. Add vitest.config.ts to each package extending base
3. Update CI to validate configurations
4. Add verification scripts to package.json
5. Run full test suite to verify

### Estimated Effort

- Small monorepo (1-5 packages): 30 minutes
- Medium monorepo (5-20 packages): 1-2 hours
- Large monorepo (20+ packages): 2-4 hours

## Common Issues Resolved

### Issue 1: Tests Fail via pnpm -r

**Before**: Tests pass in package dir, fail via `pnpm -r test`

**After**: Consistent behavior across all execution methods

### Issue 2: Workspace Dependencies Not Found

**Before**: `Error: Cannot find module 'workspace-dep'`

**After**: Proper resolution of workspace: dependencies

### Issue 3: Export Conditions

**Before**: `Error: No known conditions for export`

**After**: Exports resolve with proper conditions

## Maintenance

### Updating Configuration

When changing Vitest settings:

1. Update `vitest.config.base.ts` for shared changes
2. Update `vitest.config.ts` for root-specific changes
3. Update individual package configs for package-specific changes

### Adding New Resolution Conditions

If new package export conditions are needed:

1. Add to `vitest.config.base.ts`:

```ts
resolve: {
  conditions: [
    'development',
    'import',
    'require',
    'node',
    'default',
    // Add new conditions here
  ],
}
```

1. Verify with `pnpm verify:configs`
2. Test with `pnpm -r test`

## Related Resources

### Internal Documentation

- [Vitest Configuration Guide](./VITEST-CONFIG-GUIDE.md) - Detailed guide
- [Vitest Checklist](./VITEST-CHECKLIST.md) - Quick reference
- [CLAUDE.md](../CLAUDE.md) - Project overview

### External Resources

- [Vitest Documentation](https://vitest.dev/config/)
- [pnpm Workspaces](https://pnpm.io/workspaces)
- [Node.js Package Exports](https://nodejs.org/api/packages.html#exports)

## Contributing

When improving Vitest configuration:

1. Update this summary with changes
2. Add examples to the guide
3. Update verification scripts
4. Test on multiple Node versions
5. Document breaking changes

## Changelog

### 2025-01-10

- Created three-tier configuration pattern
- Added verification scripts
- Updated CI workflow with validation
- Wrote comprehensive documentation
- Tested across Node 20, 22, 24

---

**Status**: ✅ Implemented and validated
**Last Updated**: 2025-01-10
**Maintainer**: @neiromaster
