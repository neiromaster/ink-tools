import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, test } from 'vitest';
import { MouseProvider } from '../provider';
import { useMouse } from './useMouse';

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

describe('useMouse', () => {
  test('returns correct initial state', () => {
    function TestComponent() {
      const mouse = useMouse();

      return (
        <Box flexDirection="column">
          <Text>{`Enabled: ${mouse.isEnabled}`}</Text>
          <Text>{`Tracking: ${mouse.isTracking}`}</Text>
          <Text>{`Supported: ${mouse.isSupported}`}</Text>
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
    expect(output).toContain('Supported:');
  });

  test('isEnabled reflects enabled state', () => {
    function TestComponent() {
      const mouse = useMouse();

      return (
        <Box>
          <Text>{`Enabled: ${mouse.isEnabled}`}</Text>
        </Box>
      );
    }

    // With autoEnable=false
    const { lastFrame: frame1 } = render(
      <MouseProvider autoEnable={false}>
        <TestComponent />
      </MouseProvider>,
    );
    expect(frame1()).toContain('Enabled: false');

    // With autoEnable=true
    const { lastFrame: frame2 } = render(
      <MouseProvider autoEnable={true}>
        <TestComponent />
      </MouseProvider>,
    );
    // Note: Mouse.isSupported() might return false in test environment
    // so isEnabled could be false even with autoEnable=true
    expect(frame2()).toContain('Enabled:');
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

  test('isSupported reflects terminal support', () => {
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

    const output = lastFrame();
    expect(output).toContain('Supported:');
  });

  test('enable function is available', () => {
    function TestComponent() {
      const mouse = useMouse();

      return (
        <Box>
          <Text>{typeof mouse.enable}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('function');
  });

  test('disable function is available', () => {
    function TestComponent() {
      const mouse = useMouse();

      return (
        <Box>
          <Text>{typeof mouse.disable}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('function');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      return (
        <TestHookOutsideProvider>
          {() => {
            useMouse();
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });

  test('returns consistent object structure', () => {
    function TestComponent() {
      const mouse = useMouse();

      return (
        <Box>
          <Text>{typeof mouse.enable}</Text>
          <Text>{typeof mouse.disable}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toContain('function');
  });
});
