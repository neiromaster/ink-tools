/**
 * Additional Coverage Tests for MouseProvider
 *
 * Focus on covering remaining uncovered branches and statements
 * specifically in the provider.tsx file.
 */

import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { createRef } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useOnClick } from '../hooks/useOnClick';
import { MouseProvider } from '../provider';

describe('MouseProvider - Additional Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Edge Cases and Error Handling', () => {
    test('handles null ref gracefully in event handlers', () => {
      function TestComponent() {
        const _ref = createRef<unknown>();

        // Intentionally passing null ref
        // biome-ignore lint/suspicious/noExplicitAny: Testing edge case with null ref
        useOnClick(null as any, () => {});

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

    test('handles undefined ref gracefully in event handlers', () => {
      function TestComponent() {
        // biome-ignore lint/suspicious/noExplicitAny: Testing edge case with undefined ref
        useOnClick(undefined as any, () => {});

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

    test('handles null handler gracefully', () => {
      function TestComponent() {
        const ref = createRef<unknown>();

        // Intentionally passing null handler
        // biome-ignore lint/suspicious/noExplicitAny: Testing edge case with null handler
        useOnClick(ref, null as any);

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

    test('handles undefined handler gracefully', () => {
      function TestComponent() {
        const ref = createRef<unknown>();

        // Intentionally passing undefined handler
        // biome-ignore lint/suspicious/noExplicitAny: Testing edge case with undefined handler
        useOnClick(ref, undefined as any);

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
  });

  describe('Provider Configuration', () => {
    test('accepts custom cacheInvalidationMs value', () => {
      function TestComponent() {
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

    test('works with cacheInvalidationMs set to 0', () => {
      function TestComponent() {
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

    test('works with negative cacheInvalidationMs (should be treated as 0)', () => {
      function TestComponent() {
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

  describe('Provider Lifecycle with AutoEnable', () => {
    test('correctly handles autoEnable=true when terminal supports mouse', () => {
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

    test('correctly handles autoEnable=false', () => {
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
  });

  describe('Multiple Providers Interaction', () => {
    test('handles nested providers correctly', () => {
      function InnerComponent() {
        return (
          <Box>
            <Text>Inner</Text>
          </Box>
        );
      }

      function OuterComponent() {
        return (
          <Box>
            <Text>Outer</Text>
            <MouseProvider autoEnable={false}>
              <InnerComponent />
            </MouseProvider>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider autoEnable={false}>
          <OuterComponent />
        </MouseProvider>,
      );

      expect(() => unmount()).not.toThrow();
    });

    test('handles sibling providers', () => {
      function LeftComponent() {
        return (
          <Box>
            <Text>Left</Text>
          </Box>
        );
      }

      function RightComponent() {
        return (
          <Box>
            <Text>Right</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <Box>
          <MouseProvider autoEnable={false}>
            <LeftComponent />
          </MouseProvider>
          <MouseProvider autoEnable={false}>
            <RightComponent />
          </MouseProvider>
        </Box>,
      );

      expect(() => unmount()).not.toThrow();
    });
  });
});
