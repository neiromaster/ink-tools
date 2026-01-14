import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { useRef, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { MouseProvider } from '../provider';
import { useOnDrag } from './useOnDrag';

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

describe('useOnDrag', () => {
  test('registers drag handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [dragged, setDragged] = useState(false);

      useOnDrag(ref, () => {
        setDragged(true);
      });

      return (
        <Box>
          <Text>{dragged ? 'Dragged' : 'Not Dragged'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Dragged');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnDrag(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});
