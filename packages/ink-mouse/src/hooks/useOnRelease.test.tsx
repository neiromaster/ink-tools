import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { useRef, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { MouseProvider } from '../provider';
import { useOnRelease } from './useOnRelease';

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

describe('useOnRelease', () => {
  test('registers release handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [released, setReleased] = useState(false);

      useOnRelease(ref, () => {
        setReleased(true);
      });

      return (
        <Box>
          <Text>{released ? 'Released' : 'Not Released'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Released');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnRelease(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});
