# ink-tools

Monorepo for Ink-based TUI (Terminal User Interface) components and utilities.

## Packages

- [@ink-tools/ink-mouse](./packages/ink-mouse) - Mouse support for Ink applications
- [@ink-tools/xterm-mouse](./packages/xterm-mouse) - Low-level xterm mouse protocol handling

## Installation

```bash
bun install
```

## Development

### Running Tests

```bash
# Run all tests across all packages
bun test

# Run tests for a specific package
cd packages/ink-mouse && bun test
cd packages/xterm-mouse && bun test
```

### Building

```bash
# Build all packages
bun run build

# Build specific package (from package directory)
cd packages/xterm-mouse && bun run build
```

### Code Quality

```bash
# Type checking
bunx tsc --noEmit

# Format all code
bun run format

# Check code without auto-fixing
bun run check
```

## Publishing

This project uses Changesets for versioning and publishing. See [.changeset/README.md](./.changeset/README.md) for details.

## License

MIT
