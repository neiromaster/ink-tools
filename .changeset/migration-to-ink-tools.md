---
"@ink-tools/ink-mouse": major
---

Migrate package from `@neiropacks/ink-mouse` to `@ink-tools/ink-mouse` with version 1.0.0.

## Breaking Changes

- **Package renamed**: `@neiropacks/ink-mouse` → `@ink-tools/ink-mouse`
- **Repository moved**: `neiropacks/ink-tui-kit` → `neiromaster/ink-tools`
- **Major version bump**: 0.2.2 → 1.0.0

## Migration Required

Users need to:
1. Update dependencies: `bun remove @neiropacks/ink-mouse && bun add @ink-tools/ink-mouse@^1.0.0`
2. Update imports: `@neiropacks/ink-mouse` → `@ink-tools/ink-mouse`
3. No API changes - all hooks, components, and utilities remain identical

## What's Unchanged

- All APIs remain 100% compatible
- All features work identically
- Same peer dependencies (ink ^6.6.0, react ^19.2.3)
- Same behavior and performance

## Documentation

See [Migration Guide](../docs/migration-guide.md) for detailed migration instructions.
