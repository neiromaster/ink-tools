# @ink-tools/xterm-mouse

## 0.7.4

### Patch Changes

- 5d22855: Fix: Replace `bun changeset publish` with custom scripts that properly resolve workspace:\* dependencies during publishing. Uses `npm publish --provenance` to maintain OIDC security while ensuring workspace dependencies are converted to actual versions.

## 0.7.3

### Patch Changes

- a91faf5: Test OIDC Trusted Publishing for both scoped and unscoped packages

## 0.7.2

### Patch Changes

- 75cf63a: Migrate `@ink-tools/xterm-mouse` package into monorepo from standalone repository.

  ## What Changed

  - Moved package to `packages/xterm-mouse/`
  - Updated build configuration for monorepo integration
  - Updated `ink-mouse` to use workspace dependency (`workspace:*`)
  - Migrated all 176 tests and 7 examples
  - Updated documentation with new repository URLs
  - Added package to monorepo README

  ## What Didn't Change

  - Package name: Still `@ink-tools/xterm-mouse`
  - API: 100% backward compatible
  - All functionality preserved
  - Build output identical to standalone

  ## Testing

  - All 176 xterm-mouse tests passing
  - All 148 ink-mouse tests passing
  - Workspace dependency working correctly
  - Examples run successfully

  ## Impact

  - **For consumers:** No action required. The package works identically.
  - **For contributors:** Development now happens in the monorepo. Send PRs to the `ink-tools` repository with the `xterm-mouse` label.
