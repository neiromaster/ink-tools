# Migration Guide: @neiropacks/ink-mouse → @ink-tools/ink-mouse

This guide explains the package migration from `@neiropacks/ink-mouse` to `@ink-tools/ink-mouse`, including the breaking changes and how to update your projects.

## What Changed?

### Package Name

- **Old**: `@neiropacks/ink-mouse`
- **New**: `@ink-tools/ink-mouse`

### Version

- **Old Version**: `0.2.2`
- **New Version**: `1.0.0` (major version bump for breaking change)

### Repository

- **Old Repository**: `https://github.com/neiropacks/ink-tui-kit`
- **New Repository**: `https://github.com/neiromaster/ink-tools`

### Dependencies

The package still depends on:

- `@ink-tools/xterm-mouse` - Low-level xterm mouse protocol handling

## Why the Migration?

This migration was done to:

1. **Better discoverability**: The `@ink-tools` scope immediately indicates these are Ink-related tools
2. **Organizational structure**: Moving to a dedicated organization for Ink tooling
3. **Consistent branding**: All Ink-related packages will use the `@ink-tools` scope
4. **Repository clarity**: Renamed from `ink-tui-kit` to `ink-tools` for clarity

## Migration Steps

### 1. Update Your Dependencies

Update your `package.json`:

```bash
# Using Bun
bun remove @neiropacks/ink-mouse
bun add @ink-tools/ink-mouse@^1.0.0

# Using npm
npm uninstall @neiropacks/ink-mouse
npm install @ink-tools/ink-mouse@^1.0.0

# Using yarn
yarn remove @neiropacks/ink-mouse
yarn add @ink-tools/ink-mouse@^1.0.0

# Using pnpm
pnpm remove @neiropacks/ink-mouse
pnpm add @ink-tools/ink-mouse@^1.0.0
```

### 2. Update Import Statements

Find and replace all imports in your code:

**Before**:

```tsx
import { MouseProvider, useOnClick } from '@neiropacks/ink-mouse';
```

**After**:

```tsx
import { MouseProvider, useOnClick } from '@ink-tools/ink-mouse';
```

### 3. Update Documentation

Update any README files, documentation, or examples that reference the old package name.

### 4. Update Your Lockfile

After updating dependencies, regenerate your lockfile:

```bash
# Using Bun
bun install

# Using npm
rm package-lock.json && npm install

# Using yarn
rm yarn.lock && yarn install

# Using pnpm
rm pnpm-lock.yaml && pnpm install
```

## What Stays the Same

The API is **100% compatible** - no code changes required beyond updating import statements:

### Same API

All hooks, components, and utilities work exactly the same:

- `MouseProvider`
- `useMouse()`
- `useOnClick()`
- `useOnMouseEnter()`
- `useOnMouseLeave()`
- `useOnPress()`
- `useOnRelease()`
- `useOnWheel()`
- `useOnMouseMove()`
- `useOnDrag()`
- `getBoundingClientRect()`
- `useBoundingClientRect()`
- `getRectCenter()`
- `isRectOverlapping()`
- `isPointInRect()`

### Same Features

All features remain unchanged:

- Click detection
- Press/Release tracking
- Hover tracking
- Mouse move tracking
- Drag support
- Wheel/scroll support
- Automatic hit testing
- Performance optimization
- Configurable cache

### Same Peer Dependencies

Required peer dependencies are the same:

- `ink` ^6.6.0
- `react` ^19.2.3

## Example Migration

### Before (v0.2.2)

```json
{
  "dependencies": {
    "@neiropacks/ink-mouse": "^0.2.2"
  }
}
```

```tsx
import { MouseProvider, useOnClick } from '@neiropacks/ink-mouse';

function App() {
  return (
    <MouseProvider>
      <Button />
    </MouseProvider>
  );
}
```

### After (v1.0.0)

```json
{
  "dependencies": {
    "@ink-tools/ink-mouse": "^1.0.0"
  }
}
```

```tsx
import { MouseProvider, useOnClick } from '@ink-tools/ink-mouse';

function App() {
  return (
    <MouseProvider>
      <Button />
    </MouseProvider>
  );
}
```

**Note**: The component code is identical - only the package name changed.

## Troubleshooting

### Issue: "Cannot find module '@neiropacks/ink-mouse'"

**Solution**: Update your import statements to use `@ink-tools/ink-mouse`:

```tsx
// Old
import { MouseProvider } from '@neiropacks/ink-mouse';

// New
import { MouseProvider } from '@ink-tools/ink-mouse';
```

### Issue: "Peer dependency mismatch"

**Solution**: Ensure you have compatible versions of `ink` and `react`:

```bash
# Check versions
npm list ink react

# Update if needed
bun add ink@^6.6.0 react@^19.2.3
```

### Issue: "Cannot find module '@ink-tools/xterm-mouse'"

**Solution**: Ensure you have the latest version of `@ink-tools/xterm-mouse` installed:

```bash
bun add @ink-tools/xterm-mouse@latest
```

### Issue: Type errors after migration

**Solution**: Clear your TypeScript cache and regenerate types:

```bash
# Remove cache
rm -rf node_modules/.cache

# Reinstall dependencies
bun install

# Regenerate types
bun run build --if-present
```

## Deprecation Notice

The old package `@neiropacks/ink-mouse` is **deprecated** as of version 0.3.0:

- ❌ No new features will be added
- ❌ No bug fixes will be provided
- ✅ Security fixes only (until further notice)
- ✅ The package will remain available on npm

**Action Required**: Please migrate to `@ink-tools/ink-mouse@^1.0.0` at your earliest convenience.

## Future Plans

### Additional Packages

More Ink-related tools will be added under `@ink-tools`:

- Testing utilities
- Component libraries
- Developer tools

1. **Improved documentation**: Enhanced examples, guides, and API reference

### Staying Informed

- **Watch the repository**: <https://github.com/neiromaster/ink-tools>
- **Check npm updates**: `npm outdated @ink-tools/ink-mouse`
- **Read the changelog**: <https://github.com/neiromaster/ink-tools/blob/main/packages/ink-mouse/CHANGELOG.md>

## Support

If you encounter issues during migration:

1. **Check this guide first** - most issues are covered here
2. **Search existing issues**: <https://github.com/neiromaster/ink-tools/issues>
3. **Create a new issue**: Include your error message, package versions, and minimal reproduction

When creating issues, use the template:

```text
**Migration Issue**

**Old version**: @neiropacks/ink-mouse@0.2.2
**New version**: @ink-tools/ink-mouse@1.0.0

**Error message**:
[paste error here]

**Steps to reproduce**:
1. [step 1]
2. [step 2]

**Expected behavior**:
[what should happen]

**Actual behavior**:
[what actually happens]
```

## Rollback Plan

If you need to rollback to the old package:

```bash
# Remove new package
bun remove @ink-tools/ink-mouse

# Install old version
bun add @neiropacks/ink-mouse@0.2.2

# Update imports back
# Find and replace: @ink-tools/ink-mouse → @neiropacks/ink-mouse
```

**Note**: This is only recommended as a temporary measure. The old package is deprecated and will not receive updates.

## Summary

| Aspect | Old | New |
| :--- | :--- | :--- |
| Package | `@neiropacks/ink-mouse` | `@ink-tools/ink-mouse` |
| Version | `0.2.2` | `1.0.0` |
| Repository | `github.com/neiropacks/ink-tui-kit` | `github.com/neiromaster/ink-tools` |
| API | Compatible | Identical |
| Features | Full | Full |
| Migration Effort | N/A | 5 minutes |

**Bottom Line**: Update your import statements and dependencies - everything else works exactly the same!
