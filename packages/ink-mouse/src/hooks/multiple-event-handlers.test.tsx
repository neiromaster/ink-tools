import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { useRef, useState } from 'react';
import { describe, expect, test } from 'vitest';
import { MouseProvider } from '../provider';
import { useOnClick } from './useOnClick';
import { useOnMouseEnter } from './useOnMouseEnter';
import { useOnMouseLeave } from './useOnMouseLeave';

describe('Multiple event handlers', () => {
  test('multiple hooks can coexist on same element', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [eventCount, setEventCount] = useState(0);

      useOnClick(ref, () => {
        setEventCount((c) => c + 1);
      });
      useOnMouseEnter(ref, () => {
        setEventCount((c) => c + 1);
      });
      useOnMouseLeave(ref, () => {
        setEventCount((c) => c + 1);
      });

      return (
        <Box>
          <Text>{`Event count: ${eventCount}`}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Event count: 0');
  });
});
