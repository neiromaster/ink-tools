# CLAUDE.md

This file provides guidance for the ink-mouse package.

## Package Overview

`@ink-tools/ink-mouse` is a package for adding mouse support to Ink applications. It provides
React components and hooks for handling mouse events in terminal environments.

## Development

### Installation

```bash
bun install
```

### Building

```bash
bun run build
```

### Development Mode

```bash
bun run dev
```

## Testing

Use `bun test` to run tests.

```ts
import { test, expect } from "bun:test";

test("description", () => {
  expect(value).toBe(expected);
});
```

## Ink Component Development

This package uses **Ink** (React for CLIs). Key concepts:

### Component Structure

```tsx
import type { FC } from 'react';
import { Box, Text } from 'ink';

const Example: FC<{ prop: string }> = ({ prop }) => {
  return (
    <Box>
      <Text>{prop}</Text>
    </Box>
  );
};

export default Example;
```

### Mouse Handling

This package specifically deals with mouse events in terminals:

- Mouse position tracking
- Click detection
- Scroll handling
- Drag and drop support
- Terminal-specific mouse protocols (xterm, SGR)

### Terminal Considerations

- Not all terminals support mouse events
- Mouse support varies by terminal emulator
- Always provide keyboard alternatives
- Test across different terminals (iTerm, Terminal.app, Alacritty, etc.)

## Dependencies

- `ink` ^6.6.0 - React for CLIs (peer dependency)
- `react` ^19.2.3 - React (peer dependency)
- `@ink-tools/xterm-mouse` - Low-level xterm mouse protocol handling

## Common Issues

### Mouse Events Not Working

- Check if terminal supports mouse events
- Ensure mouse tracking is enabled in your terminal
- Some terminals require explicit mouse mode activation

### Performance

- Mouse events can fire rapidly; consider debouncing
- Use React.memo for components that re-render on mouse events
- Optimize render cycles in components with mouse handlers
