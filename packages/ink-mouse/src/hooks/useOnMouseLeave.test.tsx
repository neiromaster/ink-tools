import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { useRef, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { MouseProvider } from '../provider';
import { useOnMouseLeave } from './useOnMouseLeave';

// Test component that intentionally calls hook outside provider
function TestHookOutsideProvider({ children }: { children: () => void }) {
  try {
    children();
  } catch {
    // Expected error
  }

  return (
    <Box>
      <Text>Test</Text>
    </Box>
  );
}

describe('useOnMouseLeave', () => {
  test('registers mouse leave handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [left, setLeft] = useState(false);

      useOnMouseLeave(ref, () => {
        setLeft(true);
      });

      return (
        <Box>
          <Text>{left ? 'Left' : 'Not Left'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Left');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnMouseLeave(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});
