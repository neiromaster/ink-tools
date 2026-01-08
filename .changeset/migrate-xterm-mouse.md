---
"@ink-tools/xterm-mouse": patch
"@ink-tools/ink-mouse": patch
---

Migrate `@ink-tools/xterm-mouse` package into monorepo from standalone repository.

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
