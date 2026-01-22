---
"xterm-mouse": major
---

**BREAKING CHANGE**: Refactored `Mouse` class constructor to support full dependency injection via options object.

**Before:**
```typescript
new Mouse(inputStream?, outputStream?, emitter?, options?)
```

**After:**
```typescript
new Mouse(options?)
```

All external dependencies (`emitter`, `inputStream`, `outputStream`, `setRawMode`) are now configurable through `MouseOptions`:

```typescript
const mouse = new Mouse({
  emitter: customEmitter,        // optional, defaults to new EventEmitter()
  inputStream: process.stdin,    // optional, defaults to process.stdin
  outputStream: process.stdout,  // optional, defaults to process.stdout
  setRawMode: (mode) => {...},   // optional, defaults to stream.setRawMode
  clickDistanceThreshold: 5,     // optional, defaults to 1
});
```

**Benefits:**
- Cleaner API with single options parameter
- Better testability without mocks
- All dependencies injectable
- Backward compatible via sensible defaults

**Migration:**
```typescript
// Old
new Mouse(stream, undefined, undefined, { threshold: 5 })

// New
new Mouse({ inputStream: stream, clickDistanceThreshold: 5 })
```

Added `examples/custom-streams.ts` demonstrating dependency injection.
