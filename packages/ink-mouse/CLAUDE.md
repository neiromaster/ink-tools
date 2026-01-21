# CLAUDE.md

Package for adding mouse support to Ink applications using React components and hooks.

## Common Commands

```bash
pnpm install                # Install dependencies
pnpm run build              # Build using tsup
pnpm run dev                # Watch mode
pnpm test                   # Run tests
pnpm run test:watch         # Watch mode for tests
pnpm run test:coverage      # Coverage report
pnpm run typecheck          # TypeScript check
```

Format/lint handled from monorepo root.

## Code Organization

```text
src/
├── index.ts              # Public API exports
├── constants.ts          # Constants
├── context.ts            # React context for mouse state
├── geometry.ts           # Geometry utilities (Point, Rect)
├── provider.tsx          # MouseProvider component
├── types.ts              # TypeScript types
├── hooks/                # React hooks
│   └── useMouse.ts       # Main hook
├── utils/                # Utility functions
└── integration/          # Integration utilities
```

## Architecture

**Provider Pattern**: MouseProvider wraps app, manages mouse tracking via xterm-mouse, maintains state, emits events. useMouse hook provides state and event handlers to components.

**Ink Integration**: Uses Ink's `useStdin()` and `useStdout()` hooks to access Ink-managed streams, ensuring proper integration with the Ink application lifecycle. The xterm-mouse library controls raw mode via the `setRawMode` function from `useStdin()`.

**Dependencies**:

- `ink` ^6.6.0 (peer)
- `react` ^19.2.3 (peer)
- `xterm-mouse` (workspace:*) for low-level protocol

**Additional files**: TEST-GUIDE.md, CONTRIBUTING.md, examples/

## Ink Component Development

```tsx
import type { FC } from 'react';
import { Box, Text } from 'ink';

const Example: FC<{ prop: string }> = ({ prop }) => (
  <Box><Text>{prop}</Text></Box>
);
```

## Mouse Handling

Supports: position tracking, click detection, scroll, drag/drop, terminal protocols (xterm, SGR).

**Terminal considerations**: Not all terminals support mouse. Always provide keyboard alternatives. Test across terminals (iTerm, Terminal.app, Alacritty).

## Common Issues

**Mouse events not working**: Check terminal support, ensure mouse tracking enabled, some terminals require explicit activation.

**Performance**: Mouse events fire rapidly - consider debouncing, use React.memo, optimize render cycles.
