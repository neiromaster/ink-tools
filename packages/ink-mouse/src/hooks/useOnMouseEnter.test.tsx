import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { useRef, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { MouseProvider } from '../provider';
import { useOnMouseEnter } from './useOnMouseEnter';

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

describe('useOnMouseEnter', () => {
  test('registers mouse enter handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [entered, setEntered] = useState(false);

      useOnMouseEnter(ref, () => {
        setEntered(true);
      });

      return (
        <Box>
          <Text>{entered ? 'Entered' : 'Not Entered'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Entered');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnMouseEnter(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});
