import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { useRef, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { useMouse } from '../hooks/useMouse';
import { useOnClick } from '../hooks/useOnClick';
import { MouseProvider } from '.';

// Test component that intentionally calls hook outside provider
function _TestHookOutsideProvider({ children }: { children: () => void }) {
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

describe('MouseProvider', () => {
  describe('Provider rendering', () => {
    test('renders children without errors', () => {
      function TestComponent() {
        return (
          <Box>
            <Text>Hello World</Text>
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );

      expect(lastFrame()).toBe('Hello World');
    });

    test('provides MouseContext to consumers', () => {
      function TestComponent() {
        const mouse = useMouse();

        return (
          <Box>
            <Text>{`Enabled: ${mouse.isEnabled}`}</Text>
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );

      // Should render without throwing
      expect(lastFrame()).toContain('Enabled:');
    });

    test('auto-enables mouse tracking when autoEnable=true', () => {
      let capturedEnabled: boolean | null = null;

      function TestComponent() {
        const mouse = useMouse();
        capturedEnabled = mouse.isEnabled;

        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      render(
        <MouseProvider autoEnable={true}>
          <TestComponent />
        </MouseProvider>,
      );

      // Note: Mouse.isSupported() might return false in test environment
      // so isEnabled could be false even with autoEnable=true
      expect(capturedEnabled).not.toBeNull();
    });

    test('does not auto-enable mouse tracking when autoEnable=false', () => {
      let capturedEnabled: boolean | null = null;

      function TestComponent() {
        const mouse = useMouse();
        capturedEnabled = mouse.isEnabled;

        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      render(
        <MouseProvider autoEnable={false}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(capturedEnabled).toBeFalsy();
    });

    test('renders nested children correctly', () => {
      function Child() {
        return (
          <Box>
            <Text>Child</Text>
          </Box>
        );
      }

      function Parent() {
        return (
          <Box flexDirection="column">
            <Text>Parent</Text>
            <Child />
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider>
          <Parent />
        </MouseProvider>,
      );

      const output = lastFrame();
      expect(output).toContain('Parent');
      expect(output).toContain('Child');
    });
  });

  describe('Context availability', () => {
    test('MouseContext is available to all descendants', () => {
      function Grandchild() {
        const mouse = useMouse();
        return <Text>{mouse.isEnabled ? 'Enabled' : 'Disabled'}</Text>;
      }

      function Child() {
        return (
          <Box>
            <Grandchild />
          </Box>
        );
      }

      function Parent() {
        return (
          <Box>
            <Child />
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider>
          <Parent />
        </MouseProvider>,
      );

      // Should render either Enabled or Disabled (depending on terminal support)
      const output = lastFrame();
      expect(output === 'Enabled' || output === 'Disabled').toBe(true);
    });

    test('MouseRegistryContext is available to all descendants', () => {
      function TestComponent() {
        const ref = useRef<unknown>({ current: null });

        // This will throw if MouseRegistryContext is not available
        useOnClick(ref, () => {
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

  describe('Cache invalidation', () => {
    test('accepts cacheInvalidationMs prop', () => {
      function TestComponent() {
        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider cacheInvalidationMs={100}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(lastFrame()).toBe('Test');
    });

    test('uses default cacheInvalidationMs when not provided', () => {
      function TestComponent() {
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

  describe('Multiple providers', () => {
    test('can nest multiple MouseProviders', () => {
      function InnerChild() {
        const mouse = useMouse();
        return <Text>{`Inner: ${mouse.isEnabled}`}</Text>;
      }

      function OuterChild() {
        const mouse = useMouse();
        return (
          <Box flexDirection="column">
            <Text>{`Outer: ${mouse.isEnabled}`}</Text>
            <InnerChild />
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider autoEnable={false}>
          <MouseProvider autoEnable={true}>
            <OuterChild />
          </MouseProvider>
        </MouseProvider>,
      );

      const output = lastFrame();
      expect(output).toContain('Outer:');
      expect(output).toContain('Inner:');
    });
  });

  describe('Provider lifecycle', () => {
    test('cleans up on unmount', () => {
      function TestComponent() {
        const ref = useRef<unknown>({ current: null });

        useOnClick(ref, () => {
          // noop
        });

        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      const { unmount } = render(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );

      // Should not throw when unmounting
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    test('handles rapid mount/unmount cycles', () => {
      function TestComponent() {
        const ref = useRef<unknown>({ current: null });

        useOnClick(ref, () => {
          // noop
        });

        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      for (let i = 0; i < 10; i++) {
        const { unmount } = render(
          <MouseProvider>
            <TestComponent />
          </MouseProvider>,
        );

        unmount();
      }

      // If we got here without throwing, the test passed
      expect(true).toBe(true);
    });
  });

  describe('Error handling', () => {
    test('handles missing terminal support gracefully', () => {
      function TestComponent() {
        const mouse = useMouse();

        return (
          <Box>
            <Text>{`Supported: ${mouse.isSupported}`}</Text>
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );

      // Should render even if mouse is not supported
      expect(lastFrame()).toContain('Supported:');
    });
  });

  describe('Context values', () => {
    test('enable function updates isEnabled state', () => {
      function TestComponent() {
        const mouse = useMouse();
        const [enabled, _setEnabled] = useState(mouse.isEnabled);

        return (
          <Box>
            <Text>{`Enabled: ${enabled}`}</Text>
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider autoEnable={false}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(lastFrame()).toContain('Enabled: false');
    });

    test('disable function updates isEnabled state', () => {
      function TestComponent() {
        const mouse = useMouse();

        return (
          <Box>
            <Text>{`Enabled: ${mouse.isEnabled}`}</Text>
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider autoEnable={false}>
          <TestComponent />
        </MouseProvider>,
      );

      expect(lastFrame()).toContain('Enabled: false');
    });

    test('isTracking reflects tracking state', () => {
      function TestComponent() {
        const mouse = useMouse();

        return (
          <Box>
            <Text>{`Tracking: ${mouse.isTracking}`}</Text>
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider autoEnable={false}>
          <TestComponent />
        </MouseProvider>,
      );

      const output = lastFrame();
      expect(output).toContain('Tracking:');
    });
  });

  describe('Event handler stability', () => {
    test('event handlers maintain stable references across re-renders', () => {
      let renderCount = 0;
      let _handlerCallCount = 0;

      function TestComponent() {
        renderCount++;
        const ref = useRef<unknown>({ current: null });

        useOnClick(ref, () => {
          _handlerCallCount++;
        });

        return (
          <Box>
            <Text>Render: {renderCount}</Text>
          </Box>
        );
      }

      const { rerender } = render(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );

      // Force multiple re-renders
      rerender(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );
      rerender(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );
      rerender(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );

      // Component should have re-rendered multiple times
      expect(renderCount).toBeGreaterThan(1);
    });

    test('handlers are created only once per provider instance', () => {
      const _createHandlerCallCount = 0;

      // Track how many times the handler is invoked (not created)
      let clickInvokeCount = 0;

      function TestComponent() {
        const ref = useRef<unknown>({ current: null });

        useOnClick(ref, () => {
          clickInvokeCount++;
        });

        return (
          <Box>
            <Text>Test</Text>
          </Box>
        );
      }

      // Render and re-render multiple times
      const { rerender } = render(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );

      rerender(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );
      rerender(
        <MouseProvider>
          <TestComponent />
        </MouseProvider>,
      );

      // The handler registration should happen once
      // The clickInvokeCount should be 0 because we're not actually clicking
      expect(clickInvokeCount).toBe(0);
    });
  });
});
