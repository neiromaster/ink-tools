# Testing Monorepo Packages - Best Practices

**Purpose:** Guide for setting up comprehensive testing infrastructure for new
packages in the ink-tui-kit monorepo.

**Achievement Reference:** This pattern was established during ink-mouse package
development, achieving **95.26%** line coverage with **148 tests** across 8 test files.

## Overview

The ink-tui-kit monorepo uses a centralized testing approach with:

- **Bun Test** - Fast built-in test runner
- **Centralized coverage** - Single configuration for all packages
- **CI/CD integration** - Automated testing on push/PR
- **Future-proof design** - Works automatically for new packages

## Quick Start for New Packages

### 1. Minimal Setup (Required)

Add `test` script to your `packages/your-package/package.json`:

```json
{
  "scripts": {
    "test": "bun test"
  }
}
```

That's it! The centralized system handles everything else.

### 2. Run Tests

```bash
# Run all tests across monorepo
bun test

# Run specific package tests
cd packages/your-package
bun test
```

## Centralized Configuration

All coverage configuration lives in **one file** at the repository root:

### `bunfig.toml` (Repository Root)

```toml
[test]
# Coverage configuration
coverage = false
coverageThreshold = { lines = 0.8, functions = 0.8 }
coverageSkipTestFiles = true
coverageReporter = ["text"]
coverageDir = "coverage"

# Files/patterns to exclude from coverage
coveragePathIgnorePatterns = [
  "**/*.test.ts",
  "**/*.test.tsx",
  "**/*.spec.ts",
  "**/*.spec.tsx",
  "dist/**",
  "*.d.ts",
  "**/mocks/**",
  "**/__mocks__/**",
  "**/fixtures/**",
]

coverageIgnoreSourcemaps = false
testNamePattern = ""
testTimeout = 5000
```

**Key Benefits:**

- ✅ Single source of truth for all packages
- ✅ Consistent thresholds (80% lines/functions)
- ✅ Automatic exclusion of test files and mocks
- ✅ Works for future packages automatically

### Root `package.json` Scripts

```json
{
  "scripts": {
    "test": "bun run --filter \"*\" test",
    "test:coverage": "bun run --filter \"*\" test --coverage",
    "test:coverage:lcov": "bun run --filter \"*\" test --coverage --coverage-reporter=lcov",
    "test:coverage:reporters": "bun run --filter \"*\" test --coverage --coverage-reporter=text --coverage-reporter=lcov"
  }
}
```

**How it works:**

- Uses Bun workspaces `--filter` flag
- `*` wildcard matches all packages in `packages/*`
- Runs tests in parallel across all packages
- Generates combined coverage reports

## Package Testing Setup

### Directory Structure

```text
packages/your-package/
├── src/
│   ├── utils/
│   │   └── util.ts
│   ├── component.tsx
│   └── index.ts
├── test/                    # Test-specific code
│   └── mocks/               # Mock utilities
│       └── your-mock.ts
├── src/
│   ├── utils/
│   │   └── util.test.ts    # Test files next to source
│   └── component.test.tsx
├── package.json
└── tsconfig.json
```

### Package `package.json`

```json
{
  "name": "@your-scope/your-package",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "test": "bun test",
    "build": "tsup",
    "dev": "tsup --watch"
  },
  "devDependencies": {
    "tsup": "^8.5.1",
    "typescript": "^5.9.3"
  }
}
```

**Key Points:**

- `"type": "module"` - Required for ESM
- `"test": "bun test"` - Enables centralized testing
- No test dependencies needed (Bun has built-in test runner)

### `.gitignore` for Package

```text
# dependencies
node_modules

# output
dist
*.tgz

# code coverage
coverage
*.lcov

# logs
logs
*.log

# caches
.eslintcache
.cache
*.tsbuildinfo

# IDE
.idea
.DS_Store
```

**Critical:** Include `coverage/` to prevent committing coverage reports.

## Writing Tests

### Basic Test Structure

```typescript
// src/utils/util.test.ts
import { describe, expect, test } from 'bun:test';

describe('utilFunction', () => {
  test('does something specific', () => {
    const result = utilFunction(input);
    expect(result).toBe(expected);
  });
});
```

### Testing React Components

**CRITICAL:** Files with JSX must use `.tsx` extension!

```typescript
// src/component.test.tsx ✅ CORRECT
// src/component.test.ts  ❌ WRONG - will fail

import { render } from 'ink-testing-library';
import { describe, expect, test } from 'bun:test';
import React from 'react';
import { Box, Text } from 'ink';
import { YourComponent } from './component';

describe('YourComponent', () => {
  test('renders correctly', () => {
    const { lastFrame } = render(<YourComponent />);
    expect(lastFrame()).toContain('Expected text');
  });
});
```

### Creating Mock Utilities

For complex mocking (like Ink's DOMElement), create reusable mocks:

```typescript
// test/mocks/your-mock.ts
export function createMockThing(props: {
  prop1: string;
  prop2: number;
}) {
  return {
    prop1: props.prop1,
    prop2: props.prop2,
    // ... mock implementation
  };
}
```

Then use in tests:

```typescript
import { createMockThing } from '../../test/mocks/your-mock';

test('uses mock thing', () => {
  const mock = createMockThing({ prop1: 'test', prop2: 42 });
  // ... test code
});
```

## Coverage Goals

### Targets

- **80%** overall (configured threshold)
- **90%+** for critical paths
- **95%+** for utilities and pure functions

### Measuring Coverage

```bash
# Quick check (console output)
bun run test:coverage

# Full report with LCOV for CI/CD
bun run test:coverage:lcov

# Both formats
bun run test:coverage:reporters
```

### Coverage Output Example

```text
@ink-tools/your-package test:  All files |  95.26 |  97.44 |
@ink-tools/your-package test:  src/index.ts           |  100.00 |  100.00 |
@ink-tools/your-package test:  src/utils.ts            |   90.00 |   85.00 |
```

**Interpretation:**

- First percentage: **Function coverage**
- Second percentage: **Line coverage**
- Columns show per-file breakdown

## CI/CD Integration

### GitHub Actions Workflow

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Test
    runs-on: ubuntu-latest

    steps:
      - name: Checkout Repo
        uses: actions/checkout@v6

      - name: Setup Bun
        uses: oven-sh/setup-bun@v2
        with:
          bun-version: latest

      - name: Install dependencies
        run: bun install

      - name: Type check
        run: bun run typecheck

      - name: Lint check
        run: bun run check

      - name: Run tests
        run: bun test

      - name: Generate coverage report
        run: bun run test:coverage:lcov

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v5
        with:
          files: ./packages/your-package/coverage/lcov.info
          flags: your-package
          name: your-package-coverage
          fail_ci_if_error: false
```

**Key Features:**

- Runs on every push/PR to main
- Type checking, linting, and tests
- Coverage uploaded to Codecov
- Doesn't fail CI if coverage upload fails

### Adding Coverage Badges (Optional)

Add to your `README.md`:

```markdown
![Coverage](https://img.shields.io/codecov/c/github/your-org/ink-tui-kit/main/packages/your-package)
```

## Testing Best Practices

### 1. Test Organization

**✅ DO:**

- Place test files next to source code
- Use `.test.ts` for TypeScript files
- Use `.test.tsx` for files with JSX
- Group related tests with `describe`
- Use descriptive test names

**❌ DON'T:**

- Create separate `tests/` directory at root
- Mix test files with source in same directory without `.test.` suffix
- Use vague test names like "works"

### 2. Test Structure

```typescript
describe('Component', () => {
  describe('when user clicks button', () => {
    test('triggers action', () => {
      // Arrange
      const input = { value: 'test' };

      // Act
      const result = handleClick(input);

      // Assert
      expect(result).toBe(true);
    });
  });
});
```

### 3. Mock Realistically

```typescript
// ✅ GOOD - Minimal, focused mock
const mockElement = {
  yogaNode: { getComputedLayout: () => ({ left: 10, top: 20 }) }
};

// ❌ BAD - Over-mocking
const mockElement = {
  yogaNode: {
    getComputedLayout: () => ({ left: 10, top: 20, width: 100, height: 50 }),
    otherMethod: () => {},
    anotherMethod: () => {},
    // ... 20 more methods
  },
  parentNode: null,
  childNodes: [],
  // ... everything
};
```

### 4. Test Behavior, Not Implementation

```typescript
// ✅ GOOD - Tests what happens
test('displays error message when API fails', async () => {
  const { lastFrame } = render(<Component />);
  expect(lastFrame()).toContain('Error loading data');
});

// ❌ BAD - Tests how it works
test('calls useEffect with empty array', () => {
  // Don't test React internals
});
```

### 5. Use Descriptive Test Names

```typescript
// ✅ GOOD - Clear and specific
test('returns 0 when element is null', () => {
  expect(getElementPosition(null)).toEqual({ left: 0, top: 0 });
});

// ❌ BAD - Vague
test('works with null', () => {
  // ...
});
```

## Common Patterns

### Testing Pure Functions

```typescript
describe('calculateTotal', () => {
  test('returns sum of all items', () => {
    const items = [
      { price: 10, quantity: 2 },
      { price: 5, quantity: 1 },
    ];

    const total = calculateTotal(items);

    expect(total).toBe(25);
  });

  test('handles empty array', () => {
    expect(calculateTotal([])).toBe(0);
  });
});
```

### Testing React Hooks

```typescript
describe('useYourHook', () => {
  test('returns initial value', () => {
    function TestComponent() {
      const value = useYourHook();
      const text = `Value: ${value}`;

      return <Box><Text>{text}</Text></Box>;
    }

    const { lastFrame } = render(<TestComponent />);
    expect(lastFrame()).toBe('Value: initial');
  });

  test('handles null ref gracefully', () => {
    function TestComponent() {
      const value = useYourHook({ current: null });
      return <Box><Text>OK</Text></Box>;
    }

    const { lastFrame } = render(<TestComponent />);
    expect(lastFrame()).toBe('OK');
  });
});
```

### Testing Integration

```typescript
describe('Integration: Complete workflow', () => {
  test('component with multiple handlers works', () => {
    function TestComponent() {
      const ref = React.useRef(null);
      useOnClick(ref, () => {});
      useOnMouseEnter(ref, () => {});

      return <Box><Text>Multi-handler</Text></Box>;
    }

    const { lastFrame, unmount } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>
    );

    expect(lastFrame()).toBe('Multi-handler');
    expect(() => unmount()).not.toThrow();
  });
});
```

## Troubleshooting

### Tests Not Found

**Problem:** `bun test` can't find your tests

**Solutions:**

1. Ensure test files end in `.test.ts` or `.test.tsx`
2. Check files are in `src/` directory
3. Verify `"test": "bun test"` is in package.json

### Coverage Not Generated

**Problem:** Coverage report is empty or missing

**Solutions:**

1. Run `bun run test:coverage` (not just `bun test`)
2. Check `coverage/` is in `.gitignore`
3. Verify `bunfig.toml` exists at repository root
4. Try cleaning coverage: `rm -rf packages/*/coverage`

### JSX Errors

**Problem:** `SyntaxError: Unexpected token '<'`

**Solution:** Rename test file from `.test.ts` to `.test.tsx`

### Import Errors

**Problem:** `Cannot find module './your-module'`

**Solutions:**

1. Check `tsconfig.json` has correct paths
2. Verify module exists in `src/`
3. Use `.js` extension for ESM imports: `import { thing } from './thing.js'`

## Documentation Templates

### Package README Testing Section

Add to your package README:

```markdown
## Testing

This package has comprehensive test coverage:

- **XX.XX%** line coverage
- **YY.YY%** function coverage
- **N tests** across M test files

### Running Tests

```bash
# Run all tests in monorepo
bun test

# Run with coverage
bun run test:coverage

# Run specific package tests
cd packages/your-package
bun test
```

### Writing Tests

See [TEST-GUIDE.md](./TEST-GUIDE.md) for detailed testing documentation.

### TEST-GUIDE.md for Package

Create comprehensive testing guide:

```markdown
# Testing Guide for @your-scope/your-package

## Overview

The test suite uses:
- **Bun Test** - Fast built-in test runner
- **Custom mocks** - For complex dependencies

## Test Structure

[Directory structure diagram]

## Running Tests

[Commands and examples]

## Writing Tests

[Patterns and examples]

## Testing Utilities

[Mock utilities documentation]

## Common Patterns

[Code examples]

## Best Practices

[Guidelines]

## Troubleshooting

[Common issues and solutions]
```

## References

### Internal Documentation

- [ink-mouse TEST-GUIDE.md](../packages/ink-mouse/TEST-GUIDE.md) - Comprehensive testing example
- [CLAUDE.md Testing Section](./CLAUDE.md#testing) - Root testing configuration
- [bunfig.toml](./bunfig.toml) - Centralized coverage configuration

### External Resources

- [Bun Test Documentation](https://bun.sh/docs/test)
- [React Testing Library Principles](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)
- [Testing Best Practices](https://testingjavascript.com/)

## Success Metrics

The ink-mouse package achieved:

- ✅ **95.26%** line coverage (exceeds 80% threshold)
- ✅ **97.44%** function coverage
- ✅ **148 tests** across 8 files
- ✅ **764ms** execution time (well under 5 second target)
- ✅ CI/CD integration with automated testing

**Aim for similar metrics in new packages.**

---

**Last Updated:** 2025-01-07
**Pattern Established By:** ink-mouse package testing infrastructure
**Maintained By:** @ink-tools
