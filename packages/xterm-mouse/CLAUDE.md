# CLAUDE.md

TypeScript library for capturing/parsing mouse events from xterm-compatible terminals. Event-based (EventEmitter) and streaming (async generators) APIs.

## Common Commands

```bash
pnpm run build              # Build (ESM + CJS to dist/)
pnpm run dev                # Watch mode

pnpm test                   # Run tests
pnpm run test:coverage      # Coverage report

pnpm run typecheck          # TypeScript check
pnpm run lint/format        # Via Biome/dprint from root

pnpm run dev:basic          # Run basic example
pnpm run dev:streaming      # Run streaming example
```

Additional examples:
`dev:custom-threshold`, `dev:pause-resume`, `dev:custom-streams`,
`dev:interactive-buttons/menu/grid`

## Architecture

**Core components**:

- **Mouse** (`src/core/Mouse.ts`): Main class managing mouse tracking, stdin/stdout, emits events
- **ANSI Parser** (`src/parser/`): Parses escape sequences, supports SGR (modern) and ESC (legacy) protocols, run-length deduplication
- **Types** (`src/types/`): Discriminated unions for mouse events

**Event flow**: `Mouse.enable()` → raw stdin → ANSI parser → EventEmitter/async generators → `Mouse.disable()`

**Protocols**: SGR (`\x1b[<Cb;Cx;CyM/m`) unlimited coordinates, ESC (`\x1b[MCbCxCy`) limited to 223/95. Parser auto-detects.

**Event types**: `press`, `release`, `click` (synthesized), `drag`, `move`, `wheel`

**Resource management**: FinalizationRegistry for GC cleanup, but always call `destroy()` explicitly. `pause()`/`resume()` for fast throttling.

**Streaming API**: `eventsOf()`/`stream()` return async generators with AbortSignal, configurable queue (default 100, max 1000), `latestOnly` mode for high-frequency events.

**Type inference**: `EventByAction<T>` maps event action to specific type. `Mouse.on('wheel', ...)` knows `button` is wheel type. Exported from `src/types/eventHandler.ts`.

**One-time listeners**: `Mouse.once()` auto-removes after first invocation, type-safe like `on()`.

## Code Organization

```text
src/
├── index.ts              # Public API
├── core/
│   ├── Mouse.ts          # Main Mouse class
│   └── Mouse.test.ts
├── parser/
│   ├── ansiParser.ts     # ANSI parser
│   ├── ansiParser.test.ts
│   └── constants.ts      # ANSI codes/regex
└── types/
    ├── index.ts          # Barrel export
    ├── action.ts         # MouseEventAction
    ├── button.ts         # ButtonType union
    ├── event.ts          # MouseEvent discriminated union
    ├── eventHandler.ts   # Type inference utilities
    ├── eventHandler.test.ts
    ├── options.ts        # MouseOptions
    ├── error.ts          # MouseError
    └── stream.ts         # ReadableStreamWithEncoding
```

## Testing

Vitest, tests co-located (`.test.ts`). Mouse class requires TTY for integration tests - unit tests mock stdin/stdout. Run examples in real terminal to verify.

## Development Notes

- Use **pnpm**
- ESM-only (`"type": "module"`)
- Terminal mouse tracking **requires TTY** - won't work in piped/non-interactive environments
- **Check support before enabling**: Use `Mouse.isSupported()` or `Mouse.checkSupport()` to verify capabilities before `mouse.enable()`
- `click` event is synthesized from `press` + `release`, not from terminal

## Package Structure

**Includes**: `examples/` (demo scripts), `docs/` (ARCHITECTURE.md, PROTOCOLS.md, TESTING.md), `test/` (fixtures), `CONTRIBUTING.md`

**Build output**: ESM (`dist/index.js` + `.d.ts`) and CJS (`dist/index.cjs` + `.d.cts`). ESM-first with CJS compatibility.
