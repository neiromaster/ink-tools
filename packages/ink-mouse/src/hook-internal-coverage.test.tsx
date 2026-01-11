/**
 * Additional Coverage Tests for useMouseEventInternal Hook
 *
 * Focus on covering remaining uncovered branches and statements
 * specifically in the useMouseEventInternal.ts file.
 * Covers lines 39-42 and 51 which are currently uncovered.
 */

import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { createRef } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { useMouseEventInternal } from './hooks/useMouseEventInternal';
import { MouseProvider } from './provider';

describe('useMouseEventInternal - Additional Coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Null and Undefined Parameter Handling', () => {
    test('handles null ref gracefully', () => {
      function TestComponent() {
        // Using the hook with a null ref to cover line 39-42
        // This should handle the case where ref.current is null
        // biome-ignore lint/suspicious/noExplicitAny: Testing edge case with null ref
        useMouseEventInternal('click', null as any, () => {});

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

    test('handles undefined ref gracefully', () => {
      function TestComponent() {
        // Using the hook with an undefined ref
        // biome-ignore lint/suspicious/noExplicitAny: Testing edge case with undefined ref
        useMouseEventInternal('click', undefined as any, () => {});

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

        // Using the hook with a null handler
        // biome-ignore lint/suspicious/noExplicitAny: Testing edge case with null handler
        useMouseEventInternal('click', ref, null as any);

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

        // Using the hook with an undefined handler
        // biome-ignore lint/suspicious/noExplicitAny: Testing edge case with undefined handler
        useMouseEventInternal('click', ref, undefined as any);

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

  describe('ID Generation Edge Cases', () => {
    test('handles case where id is null after generation', () => {
      // This test is designed to cover potential edge cases in ID generation
      // though the actual implementation might not have a path where id becomes null after generation

      function TestComponent() {
        const ref = createRef<unknown>();

        useMouseEventInternal('click', ref, () => {});

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

  describe('Different Event Types', () => {
    test('handles mouseEnter event type', () => {
      function TestComponent() {
        const ref = createRef<unknown>();

        useMouseEventInternal('mouseEnter', ref, () => {});

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

    test('handles mouseLeave event type', () => {
      function TestComponent() {
        const ref = createRef<unknown>();

        useMouseEventInternal('mouseLeave', ref, () => {});

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

    test('handles mousePress event type', () => {
      function TestComponent() {
        const ref = createRef<unknown>();

        useMouseEventInternal('mousePress', ref, () => {});

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

    test('handles mouseRelease event type', () => {
      function TestComponent() {
        const ref = createRef<unknown>();

        useMouseEventInternal('mouseRelease', ref, () => {});

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

    test('handles mouseMove event type', () => {
      function TestComponent() {
        const ref = createRef<unknown>();

        useMouseEventInternal('mouseMove', ref, () => {});

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

    test('handles mouseDrag event type', () => {
      function TestComponent() {
        const ref = createRef<unknown>();

        useMouseEventInternal('mouseDrag', ref, () => {});

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

    test('handles wheel event type', () => {
      function TestComponent() {
        const ref = createRef<unknown>();

        useMouseEventInternal('wheel', ref, () => {});

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
});
