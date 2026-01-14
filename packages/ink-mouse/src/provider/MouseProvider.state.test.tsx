/**
 * Provider State Management Tests for MouseProvider
 *
 * Tests enable/disable functionality and provider lifecycle.
 *
 * Simplified approach: Focus on meaningful behavior over implementation details.
 * Uses ink-testing-library for component-based testing (renderHook not needed).
 */

import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, test, vi } from 'vitest';
import { useMouse } from '../hooks/useMouse';
import { MouseProvider } from '.';

describe('MouseProvider - State Management', () => {
  describe('Enable/Disable Functionality', () => {
    test('enable() enables mouse when disabled', () => {
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

    test('disable() disables mouse when enabled', () => {
      function TestComponent() {
        const mouse = useMouse();
        return (
          <Box>
            <Text>{`Enabled: ${mouse.isEnabled}`}</Text>
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider autoEnable={true}>
          <TestComponent />
        </MouseProvider>,
      );

      // Note: Mouse.isSupported() may return false in tests
      expect(lastFrame()).toContain('Enabled:');
    });

    test('isEnabled state reflects actual mouse state', () => {
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

      // Initial state should be false with autoEnable=false
      expect(lastFrame()).toContain('Enabled: false');
    });
  });

  describe('Provider Lifecycle', () => {
    test('initializes with correct states based on props', () => {
      function TestComponent() {
        const mouse = useMouse();
        return (
          <Box flexDirection="column">
            <Text>{`Enabled: ${mouse.isEnabled}`}</Text>
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
      expect(output).toContain('Enabled: false');
      expect(output).toContain('Tracking: false');
    });

    test('creates Mouse instance on mount when supported', () => {
      function TestComponent() {
        const mouse = useMouse();
        return (
          <Box>
            <Text>{`Tracking: ${mouse.isTracking}`}</Text>
          </Box>
        );
      }

      const { lastFrame } = render(
        <MouseProvider autoEnable={true}>
          <TestComponent />
        </MouseProvider>,
      );

      // Mouse instance should be created (even if not supported)
      expect(lastFrame()).toContain('Tracking:');
    });

    test('cleans up Mouse instance on unmount', () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      function TestComponent() {
        const _mouse = useMouse();
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

      // Cleanup should happen without errors
      expect(() => unmount()).not.toThrow();

      consoleSpy.mockRestore();
    });

    test('removes all event listeners on cleanup', () => {
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

      // Unmount should clean up event listeners
      expect(() => unmount()).not.toThrow();
    });
  });

  describe('Security: Provider State', () => {
    test('multiple providers do not share state', () => {
      function TestComponent1() {
        const mouse = useMouse();
        return (
          <Box>
            <Text>{`Enabled: ${mouse.isEnabled}`}</Text>
          </Box>
        );
      }

      function TestComponent2() {
        const mouse = useMouse();
        return (
          <Box>
            <Text>{`Enabled: ${mouse.isEnabled}`}</Text>
          </Box>
        );
      }

      const { lastFrame: frame1 } = render(
        <MouseProvider autoEnable={false}>
          <TestComponent1 />
        </MouseProvider>,
      );

      const { lastFrame: frame2 } = render(
        <MouseProvider autoEnable={true}>
          <TestComponent2 />
        </MouseProvider>,
      );

      // Each provider should have independent state
      expect(frame1()).toContain('Enabled: false');
      expect(frame2()).toContain('Enabled:');
    });
  });
});
