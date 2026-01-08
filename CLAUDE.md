# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **monorepo** for building Ink-based TUI (Terminal User Interface) components and
utilities. It uses **Bun** as the primary JavaScript runtime and package manager, organized as
a workspace with packages in the `packages/` directory.

**Ink** is a React-based library for building interactive command-line interfaces (CLIs) using
React components. All packages in this monorepo are designed for terminal environments and
should work with Ink applications.

The monorepo uses:

- **Bun workspaces** for package management
- **Changesets** for versioning and publishing
- **tsup** for building packages
- **Biome** for linting and formatting (TypeScript/JavaScript/JSON)
- **dprint** for formatting YAML
- **markdownlint-cli2** for linting and formatting Markdown

## Common Commands

### Installation

```bash
bun install
```

### Building

```bash
# Build all packages
bun run build

# Build specific package (from package directory)
cd packages/ink-mouse && bun run build

# Watch mode for development
bun run dev
```

### Code Quality

```bash
# Type checking (runs in pre-commit)
bun run typecheck

# Format all code (runs via lefthook pre-commit)
bun run format

# Format individual file types
bun run format:biome    # TypeScript/JavaScript/JSON
bun run format:dprint   # YAML
bun run format:markdown # Markdown

# Check code without auto-fixing
bun run check

# Lint Markdown without auto-fixing
bun run lint:markdown
```

### Testing

```bash
# Run all tests across all packages
bun test

# Run tests with coverage report (text output to console)
bun run test:coverage

# Generate LCOV coverage reports for CI/CD
bun run test:coverage:lcov

# Generate both text and LCOV reports
bun run test:coverage:reporters
```

#### Coverage Configuration

Coverage is configured in `bunfig.toml` at the repository root:

- **Threshold**: 80% for lines and functions (configurable)
- **Output**: Text reports by default, LCOV on demand
- **Location**: `coverage/` directory in each package (gitignored)
- **Excludes**: Test files, mocks, fixtures, build artifacts, type definitions

#### Coverage Goals

- **Target**: >80% overall coverage
- **Critical paths**: >90% coverage for business logic
- **Utilities**: 100% coverage (pure functions)
- **UI components**: Lower coverage acceptable (integration tests)

#### Viewing Coverage Reports

**Text output** (default):

```bash
bun test:coverage
# Shows coverage table in terminal
```

**LCOV reports** (for CI/CD):

```bash
bun test:coverage:lcov
# Generates coverage/lcov.info in each package
# Can be uploaded to Codecov, Coveralls, etc.
```

**HTML reports** (future enhancement):

```bash
# TODO: Add HTML reporter for visual coverage inspection
# Requires: monocart-coverage-reports or similar tool
```

#### Package-Level Testing

For package-specific testing, run commands from the package directory:

```bash
cd packages/ink-mouse

# Run tests for this package only
bun test

# Run with coverage
bun test --coverage

# Run specific test file
bun test src/utils/geometry.test.ts
```

#### Coverage in CI/CD

Coverage reports integrate with CI/CD services:

- **GitHub Actions**: Upload `lcov.info` to Codecov
- **GitLab CI**: Built-in coverage parsing
- **Pull requests**: Automatic coverage comments (with Codecov setup)

Example GitHub Actions workflow:

```yaml
- name: Run tests with coverage
  run: bun run test:coverage:lcov

- name: Upload to Codecov
  uses: codecov/codecov-action@v3
  with:
    files: ./packages/*/coverage/lcov.info
```

### Publishing

The project uses Changesets for versioning:

1. Run `bun changeset` to create a changeset for your changes
2. When pushing to main, the GitHub workflow creates a release PR
3. Merging the release PR publishes packages to npm

## Package Structure

Each package in `packages/` follows this structure:

```text
packages/package-name/
├── src/           # Source files
├── dist/          # Build output (generated)
├── tsup.config.ts # Build configuration
├── tsconfig.json  # TypeScript configuration
├── biome.json     # Linting configuration (optional)
├── package.json   # Package metadata
└── README.md      # Package documentation
```

### Package Build Configuration

Packages use **tsup** for building with the following default settings:

- Entry point: `src/index.ts`
- Formats: ESM (`index.mjs`) and CJS (`index.js`)
- TypeScript declarations: `index.d.ts`
- Target: `node18`
- Bundled and minified output
- Source maps included

## Code Style

- **TypeScript/JavaScript**: Formatted with Biome
  - 120 character line width
  - Single quotes
  - Semicolons required
  - 2-space indentation for TS/JS files
  - Trailing commas

- **YAML**: Formatted with dprint
  - 2-space indentation
  - Double quotes preferred

- **Markdown**: Linted and formatted with markdownlint-cli2
  - 120 character line width (warning)
  - Proper spacing around headings and lists
  - Fenced code blocks should have language specified

- **EditorConfig**: Root configuration defines:
  - UTF-8 encoding
  - LF line endings
  - 4-space indentation (except TS/JS: 2-space)
  - 120 character line length limit

## Linting Rules

Biome enforces strict rules including:

- React best practices (hooks, JSX keys, no nested components)
  - These apply to Ink components as well (Ink uses React)
- Security (no dangerouslySetInnerHTML, no secrets)
- Code style (type aliases, consistent array types, no var)
- No import cycles
- Explicit types required
- Performance: no await in loops (warn)

Note: `dangerouslySetInnerXML` is used in Ink for rendering ANSI escapes, which is safe in
terminal environments.

## Git Hooks

Lefthook runs on pre-commit:

1. **Biome**: Auto-formats staged TypeScript/JavaScript/JSON files
2. **dprint**: Auto-formats staged YAML files
3. **markdownlint**: Auto-formats staged Markdown files
4. **Type check**: Runs TypeScript compiler check across all packages

## TypeScript Configuration

Root `tsconfig.json` settings:

- Target: ES2022
- Module resolution: bundler
- Strict mode enabled
- `noUncheckedIndexedAccess`: true
- `noImplicitOverride`: true
- JSX: react-jsx (for Ink components)

## Testing

Use `bun test` for running tests. Test files should use `.test.ts` or `.spec.ts` extensions.

Example test structure:

```ts
import { test, expect } from "bun:test";

test("description", () => {
  expect(value).toBe(expected);
});
```

### Important Testing Notes

- **Test files with JSX must use `.tsx` extension** - Rename from `.test.ts` to `.test.tsx` if using JSX
- **Ink requires `<Text>` component** - All text strings in Ink components must be wrapped in `<Text>` from 'ink'
- **Template literals in JSX** - Use variables for template literals, then interpolate in JSX:

  ```tsx
  const text = `Value: ${value}`;
  return <Box><Text>{text}</Text></Box>;
  ```

## Documentation

When creating or modifying documentation, follow these path conventions:

### Path Best Practices

**ALWAYS use relative paths instead of absolute paths:**

- ✅ **Use repository-relative paths** for project files:

  ```markdown
  See `packages/ink-mouse/src/geometry.test.ts` for examples
  ```

- ✅ **Use file-relative paths** for documentation links:

  ```markdown
  - [Related Topic](./related-topic.md)
  - [Parent Section](../README.md)
  ```

- ❌ **NEVER use absolute paths** - they break when cloned by other developers:

  ```markdown
  # WRONG - Don't do this!
  - /Users/username/projects/repo/packages/...
  ```

### Why Relative Paths Matter

Absolute paths contain machine-specific information (username, directory structure) that:

- Break when repository is cloned by other developers
- Differ between CI/CD environments
- Cause broken links and confusion
- Make documentation non-portable

### Verification

Before committing documentation changes, verify no absolute paths exist:

```bash
# Check for absolute paths in documentation
grep -r "/Users/" docs/
grep -r "/home/" docs/
```

## Working with Ink

All packages in this monorepo are designed to work with **Ink** - React for CLIs.

### Key Ink Concepts

- **Components**: Ink uses React components to render terminal output
- **Hooks**: Standard React hooks (useState, useEffect, etc.) work in Ink
- **Props**: Components receive props like standard React components
- **stdin/stdout**: Ink handles terminal input/output automatically

### Example Ink Component

```tsx
import type { FC } from 'react';
import { Box, Text } from 'ink';

const Example: FC<{ name: string }> = ({ name }) => {
  return (
    <Box borderStyle="double" padding={1}>
      <Text color="green">Hello, {name}!</Text>
    </Box>
  );
};

export default Example;
```

### Running Ink Applications

```bash
# Run an Ink application
bun run src/index.tsx

# For development with hot reload (if configured)
bun run dev
```

### Testing Ink Components

When testing Ink components, consider:

- Testing component logic separate from rendering
- Using Ink's testing utilities when available
- Mocking stdin/stdout for interactive components

### Package Dependencies

Most packages will have:

- `ink` (peer dependency) - ^6.6.0 or later
- `react` (peer dependency) - ^19.2.3 or later
- `react-reconciler` - may be needed for advanced features
- `ansi-escapes` - for terminal control sequences
- `terminal-size` - for responsive layouts

## Runtime and APIs

Default to Bun instead of Node.js:

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env files

## Adding a New Package

When creating a new Ink-related package in the monorepo:

1. Create directory in `packages/new-package/`
2. Initialize with `bun init` (or manually create package.json)
3. Add build scripts and tsup.config.ts
4. Configure package exports (ESM and CJS)
5. Add peer dependencies: `ink` and `react`
6. Add TypeScript types and configuration
7. Include example usage in README.md

Example package.json for an Ink package:

```json
{
  "name": "@ink-tools/ink-package",
  "version": "0.1.0",
  "main": "./dist/index.js",
  "module": "./dist/index.mjs",
  "types": "./dist/index.d.ts",
  "type": "module",
  "exports": {
    ".": {
      "import": "./dist/index.mjs",
      "require": "./dist/index.js",
      "types": "./dist/index.d.ts"
    }
  },
  "peerDependencies": {
    "ink": "^6.6.0",
    "react": "^19.2.3"
  }
}
```
