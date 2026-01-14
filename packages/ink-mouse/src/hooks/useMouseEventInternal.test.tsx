import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { useRef } from 'react';
import { describe, expect, test } from 'vitest';
import { MouseProvider } from '../provider';
import { useMouseEventInternal } from './useMouseEventInternal';

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

describe('useMouseEventInternal', () => {
  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useMouseEventInternal('click', ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    // Should not throw - TestHookOutsideProvider catches the error
    expect(() => render(<TestComponent />)).not.toThrow();
  });

  test('does not throw when used inside MouseProvider with valid ref and handler', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });

      useMouseEventInternal('click', ref, () => {
        // noop
      });

      return (
        <Box>
          <Text>Test</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Test');
  });
});
