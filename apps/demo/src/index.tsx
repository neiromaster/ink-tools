import { type InkMouseEvent, MouseProvider, useOnClick } from '@ink-tools/ink-mouse';
import { Box, render, Text, useInput } from 'ink';
import type { FC } from 'react';
import { useCallback, useRef, useState } from 'react';

const ClickButton: FC = () => {
  const ref = useRef(null);
  const [clicks, setClicks] = useState(0);
  const [lastEvent, setLastEvent] = useState<InkMouseEvent | null>(null);
  const clickHandler = useCallback((event: InkMouseEvent): void => {
    setClicks((prev) => prev + 1);
    setLastEvent(event);
  }, []);
  useOnClick(ref, clickHandler);

  return (
    <Box flexDirection="column" gap={1}>
      <Text bold>Click Demo:</Text>
      <Box ref={ref} borderStyle="single" borderColor="yellow" padding={1}>
        <Text>Click me! ({clicks} clicks)</Text>
      </Box>
      {lastEvent && (
        <Text dimColor>
          Last: x={lastEvent.x}, y={lastEvent.y}, button={lastEvent.button}
        </Text>
      )}
    </Box>
  );
};

const App: FC = () => {
  useInput((str, key) => {
    if (str === 'q' || key.escape) {
      process.exit(0);
    }
  });
  return (
    <MouseProvider autoEnable={true}>
      <Box flexDirection="column" padding={1} gap={1}>
        <Box borderStyle="double" borderColor="green" padding={1}>
          <Text bold color="green">
            ink-tools Demo Application
          </Text>
        </Box>

        {/* <Status /> */}

        <Box flexDirection="column" gap={1}>
          <Text bold color="yellow" underline>
            Interactive Demos
          </Text>

          <ClickButton />
          {/* <PressReleaseButton /> */}
          {/* <DragBox /> */}
          {/* <WheelBox /> */}
          {/* <HoverBox /> */}
        </Box>

        {/* <EventLogger /> */}

        <Box borderStyle="round" borderColor="blue" padding={1}>
          <Text dimColor>
            Try all the interactive elements above! Each demonstrates different mouse event handlers.
          </Text>
        </Box>
      </Box>
    </MouseProvider>
  );
};

render(<App />);
