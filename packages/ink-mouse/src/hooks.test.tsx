import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { describe, expect, test } from 'vitest';
import { useBoundingClientRect, useElementDimensions, useElementPosition } from './geometry';

describe('useElementPosition', () => {
  test('returns initial position {0, 0}', () => {
    function TestComponent() {
      const position = useElementPosition({ current: null });
      const positionText = `Position: ${position.left}, ${position.top}`;

      return (
        <Box>
          <Text>{positionText}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(<TestComponent />);

    expect(lastFrame()).toBe('Position: 0, 0');
  });

  test('handles null ref gracefully', () => {
    function TestComponent() {
      const position = useElementPosition({ current: null });
      const positionText = `Position: ${position.left}, ${position.top}`;

      return (
        <Box>
          <Text>{positionText}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(<TestComponent />);

    expect(lastFrame()).toBe('Position: 0, 0');
  });
});

describe('useElementDimensions', () => {
  test('returns initial dimensions {0, 0}', () => {
    function TestComponent() {
      const dimensions = useElementDimensions({ current: null });
      const dimensionsText = `Dimensions: ${dimensions.width}x${dimensions.height}`;

      return (
        <Box>
          <Text>{dimensionsText}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(<TestComponent />);

    expect(lastFrame()).toBe('Dimensions: 0x0');
  });

  test('handles null ref gracefully', () => {
    function TestComponent() {
      const dimensions = useElementDimensions({ current: null });
      const dimensionsText = `Dimensions: ${dimensions.width}x${dimensions.height}`;

      return (
        <Box>
          <Text>{dimensionsText}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(<TestComponent />);

    expect(lastFrame()).toBe('Dimensions: 0x0');
  });
});

describe('useBoundingClientRect', () => {
  test('returns initial zero rect', () => {
    function TestComponent() {
      const rect = useBoundingClientRect({ current: null });
      const rectText = `Left: ${rect.left}, Top: ${rect.top}, Right: ${rect.right}, Bottom: ${rect.bottom}`;

      return (
        <Box>
          <Text>{rectText}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(<TestComponent />);

    expect(lastFrame()).toBe('Left: 0, Top: 0, Right: 0, Bottom: 0');
  });

  test('handles null ref gracefully', () => {
    function TestComponent() {
      const rect = useBoundingClientRect({ current: null });
      const rectText = `x: ${rect.x}, y: ${rect.y}, width: ${rect.width}, height: ${rect.height}`;

      return (
        <Box>
          <Text>{rectText}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(<TestComponent />);

    expect(lastFrame()).toBe('x: 0, y: 0, width: 0, height: 0');
  });
});
