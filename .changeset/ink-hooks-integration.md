---
"@ink-tools/ink-mouse": minor
"xterm-mouse": minor
---

Integrate Ink's `useStdin()` and `useStdout()` hooks for proper stream management.

**@ink-tools/ink-mouse:**
- `useMouseInstance` now uses Ink's `useStdin()` and `useStdout()` hooks
- Passes Ink-managed streams to `xterm-mouse` for proper integration
- Raw mode control delegated to `xterm-mouse` via `setRawMode`

**xterm-mouse:**
- `Mouse.isSupported()` now accepts optional `inputStream` and `outputStream` parameters
- Implements method via `checkSupport()` for DRY principle
- Backwards compatible - defaults to `process.stdin`/`process.stdout`

**Benefits:**
- Proper integration with Ink's stream management
- Consistent with Ink ecosystem patterns
- Better type safety for custom streams
- Clear ownership of raw mode (xterm-mouse)
