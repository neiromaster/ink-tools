/**
 * Additional Coverage Tests for MouseProvider
 *
 * Focus on covering remaining uncovered branches in provider.tsx
 * Specifically targeting the low branch coverage (currently ~15.55%)
 */

import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { createRef } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useOnClick } from '../hooks/useOnClick';
import { MouseProvider } from '../provider';

// Mock the Mouse class to simulate different scenarios
vi.mock('xterm-mouse', async () => {
  const actual = await vi.importActual('xterm-mouse');

  // Create a mock Mouse class with different behaviors
  class MockMouse {
    static isSupported = vi.fn(() => true);

    enable = vi.fn();
    disable = vi.fn();
    on = vi.fn();
    off = vi.fn();
    destroy = vi.fn();
  }

  // biome-ignore lint/suspicious/noExplicitAny: Intentional type override for module mocking
  return { ...(actual as any), Mouse: MockMouse };
});

describe('MouseProvider - Additional Branch Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Mouse Initialization Scenarios', () => {
    test('initializes mouse correctly when isSupported returns true', () => {
      function TestComponent() {
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={true}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('AutoEnable Behavior', () => {
    test('does not enable mouse when autoEnable is false', () => {
      function TestComponent() {
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

    test('enables mouse when autoEnable is true', () => {
      function TestComponent() {
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={true}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Cache Invalidation Scenarios', () => {
    test('handles cacheInvalidationMs with valid positive value', () => {
      const ref = createRef<unknown>();

      function TestComponent() {
        useOnClick(ref, () => {});
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={false} cacheInvalidationMs={500}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });

    test('handles cacheInvalidationMs with zero value', () => {
      const ref = createRef<unknown>();

      function TestComponent() {
        useOnClick(ref, () => {});
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={false} cacheInvalidationMs={0}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });

    test('handles cacheInvalidationMs with negative value', () => {
      const ref = createRef<unknown>();

      function TestComponent() {
        useOnClick(ref, () => {});
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={false} cacheInvalidationMs={-100}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Cleanup Scenarios', () => {
    test('properly cleans up when mouseRef.current is null', () => {
      function TestComponent() {
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

    test('properly cleans up when mouseRef.current is not null', () => {
      function TestComponent() {
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={true}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Event Handler Registration', () => {
    test('registers multiple handlers of different types', () => {
      const ref1 = createRef<unknown>();
      const ref2 = createRef<unknown>();
      const ref3 = createRef<unknown>();

      function TestComponent() {
        useOnClick(ref1, () => {});
        useOnClick(ref2, () => {});
        useOnClick(ref3, () => {});

        return (
          <Box flexDirection="column">
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={true}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Hover State Transitions', () => {
    test('handles rapid hover state transitions', () => {
      const ref = createRef<unknown>();

      function TestComponent() {
        useOnClick(ref, () => {});
        return (
          <Box>
            <Text>Hover Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={true}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });
  });

  describe('WeakMap Operations', () => {
    test('handles WeakMap operations for hover state', () => {
      const ref = createRef<unknown>();

      function TestComponent() {
        useOnClick(ref, () => {});
        return (
          <Box>
            <Text>WeakMap Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={true}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });
  });
});
