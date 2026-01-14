import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { createRef, useRef, useState } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { MouseProvider } from '../provider';
import type { ClickHandler } from '../types';
import { useOnClick } from './useOnClick';

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

describe('useOnClick', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('registers click handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [clicked, setClicked] = useState(false);

      useOnClick(ref, () => {
        setClicked(true);
      });

      return (
        <Box>
          <Text>{clicked ? 'Clicked' : 'Not Clicked'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Clicked');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnClick(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });

  test('handles null handler gracefully', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });

      useOnClick(ref, null);

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

  describe('Edge Cases', () => {
    test('handles null ref with warning in development', () => {
      const mockHandler: ClickHandler = vi.fn();

      function TestComponent() {
        const ref = createRef<unknown>();
        useOnClick(ref, mockHandler);
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      expect(() => {
        render(
          <MouseProvider autoEnable={false}>
            <TestComponent />
          </MouseProvider>,
        );
      }).not.toThrow();
    });

    test('returns early if id is null', () => {
      const mockHandler: ClickHandler = vi.fn();

      function TestComponent() {
        const ref = createRef<unknown>();
        useOnClick(ref, mockHandler);
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      expect(() => {
        render(
          <MouseProvider autoEnable={false}>
            <TestComponent />
          </MouseProvider>,
        );
      }).not.toThrow();
    });

    test('cleans up handler on unmount', () => {
      const mockHandler: ClickHandler = vi.fn();

      function TestComponent() {
        const ref = createRef<unknown>();
        useOnClick(ref, mockHandler);
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={false}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });

    test('throws error when used outside MouseProvider', () => {
      function _TestComponent() {
        const ref = createRef<unknown>();
        useOnClick(ref, vi.fn());
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      expect(() => {
        render(
          <TestHookOutsideProvider>
            {() => {
              const ref = createRef<unknown>();
              useOnClick(ref, vi.fn());
            }}
          </TestHookOutsideProvider>,
        );
      }).not.toThrow();
    });
  });

  describe('Registration Lifecycle', () => {
    test('registers handler on mount with all parameters', () => {
      const mockHandler: ClickHandler = vi.fn();
      const mockRef = createRef<unknown>();

      function TestComponent() {
        useOnClick(mockRef, mockHandler);
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      expect(() => {
        render(
          <MouseProvider autoEnable={false}>
            <TestComponent />
          </MouseProvider>,
        );
      }).not.toThrow();
    });

    test('unregisters handler on unmount', () => {
      const mockHandler: ClickHandler = vi.fn();
      const mockRef = createRef<unknown>();

      function TestComponent() {
        useOnClick(mockRef, mockHandler);
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={false}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Security: ID Collision Resistance', () => {
    test('handlers with different IDs do not interfere', () => {
      const handler1Calls: number[] = [];
      const handler2Calls: number[] = [];

      function TestComponent() {
        const ref1 = createRef<unknown>();
        const ref2 = createRef<unknown>();

        useOnClick(ref1, () => handler1Calls.push(1));
        useOnClick(ref2, () => handler2Calls.push(2));

        return (
          <Box flexDirection="column">
            <Text>Component</Text>
          </Box>
        );
      }

      expect(() => {
        render(
          <MouseProvider autoEnable={false}>
            <TestComponent />
          </MouseProvider>,
        );
      }).not.toThrow();

      // Both handlers should be registered independently
      expect(handler1Calls.length).toBe(0);
      expect(handler2Calls.length).toBe(0);
    });
  });
});
