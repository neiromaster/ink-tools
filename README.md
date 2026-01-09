# ink-tools

Monorepo for Ink-based TUI (Terminal User Interface) components and utilities.

## Packages

- [@ink-tools/ink-mouse](./packages/ink-mouse) - Mouse support for Ink applications
- [@ink-tools/xterm-mouse](./packages/xterm-mouse) - Low-level xterm mouse protocol handling

## Installation

```bash
pnpm install
```

## Development

### Running Tests

```bash
# Run all tests across all packages
pnpm test

# Run tests for a specific package
cd packages/ink-mouse && pnpm test
cd packages/xterm-mouse && pnpm test
```

### Building

```bash
# Build all packages
pnpm run build

# Build specific package (from package directory)
cd packages/xterm-mouse && pnpm run build
```

### Code Quality

```bash
# Type checking
pnpm run typecheck

# Format all code
pnpm run format

# Check code without auto-fixing
pnpm run check
```

## Publishing

This project uses Changesets for versioning and publishing. See [.changeset/README.md](./.changeset/README.md) for details.

## License

MIT
