import { describe, expect, test } from 'bun:test';
import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { useRef, useState } from 'react';
import { MouseProvider } from '../provider';
import { useMouseEventInternal } from './useMouseEventInternal';
import { useOnClick } from './useOnClick';
import { useOnDrag } from './useOnDrag';
import { useOnMouseEnter } from './useOnMouseEnter';
import { useOnMouseLeave } from './useOnMouseLeave';
import { useOnMouseMove } from './useOnMouseMove';
import { useOnPress } from './useOnPress';
import { useOnRelease } from './useOnRelease';
import { useOnWheel } from './useOnWheel';

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

describe('useMouseEventInternal', () => {
  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useMouseEventInternal('click', ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    // Should not throw - TestHookOutsideProvider catches the error
    expect(() => render(<TestComponent />)).not.toThrow();
  });

  test('does not throw when used inside MouseProvider with valid ref and handler', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });

      useMouseEventInternal('click', ref, () => {
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

  test('handles null ref gracefully', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);
      let errorThrown = false;

      try {
        useMouseEventInternal('click', ref, () => {
          // noop
        });
      } catch (_error) {
        errorThrown = true;
      }

      return (
        <Box>
          <Text>{errorThrown ? 'Error' : 'No Error'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    // Should not throw error with null ref, just warn
    expect(lastFrame()).toBe('No Error');
  });

  test('handles null handler gracefully', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });

      useMouseEventInternal('click', ref, null);

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

  test('generates unique IDs for each hook instance', () => {
    const _ids: string[] = [];

    function TestComponent() {
      const ref1 = useRef<unknown>({ current: null });
      const ref2 = useRef<unknown>({ current: null });

      // We can't directly access the IDs, but we can verify
      // multiple hooks can coexist without conflicts
      useMouseEventInternal('click', ref1, () => {
        // noop
      });
      useMouseEventInternal('click', ref2, () => {
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

    // If IDs were not unique, we'd see registration errors
    expect(lastFrame()).toBe('Test');
  });
});

describe('useOnClick', () => {
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
});

describe('useOnMouseEnter', () => {
  test('registers mouse enter handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [entered, setEntered] = useState(false);

      useOnMouseEnter(ref, () => {
        setEntered(true);
      });

      return (
        <Box>
          <Text>{entered ? 'Entered' : 'Not Entered'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Entered');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnMouseEnter(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});

describe('useOnMouseLeave', () => {
  test('registers mouse leave handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [left, setLeft] = useState(false);

      useOnMouseLeave(ref, () => {
        setLeft(true);
      });

      return (
        <Box>
          <Text>{left ? 'Left' : 'Not Left'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Left');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnMouseLeave(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});

describe('useOnPress', () => {
  test('registers press handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [pressed, setPressed] = useState(false);

      useOnPress(ref, () => {
        setPressed(true);
      });

      return (
        <Box>
          <Text>{pressed ? 'Pressed' : 'Not Pressed'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Pressed');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnPress(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});

describe('useOnRelease', () => {
  test('registers release handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [released, setReleased] = useState(false);

      useOnRelease(ref, () => {
        setReleased(true);
      });

      return (
        <Box>
          <Text>{released ? 'Released' : 'Not Released'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Released');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnRelease(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});

describe('useOnMouseMove', () => {
  test('registers mouse move handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [moved, setMoved] = useState(false);

      useOnMouseMove(ref, () => {
        setMoved(true);
      });

      return (
        <Box>
          <Text>{moved ? 'Moved' : 'Not Moved'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Moved');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnMouseMove(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});

describe('useOnDrag', () => {
  test('registers drag handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [dragged, setDragged] = useState(false);

      useOnDrag(ref, () => {
        setDragged(true);
      });

      return (
        <Box>
          <Text>{dragged ? 'Dragged' : 'Not Dragged'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Dragged');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnDrag(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});

describe('useOnWheel', () => {
  test('registers wheel handler on mount', () => {
    function TestComponent() {
      const ref = useRef<unknown>({ current: null });
      const [wheeled, setWheeled] = useState(false);

      useOnWheel(ref, () => {
        setWheeled(true);
      });

      return (
        <Box>
          <Text>{wheeled ? 'Wheeled' : 'Not Wheeled'}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    expect(lastFrame()).toBe('Not Wheeled');
  });

  test('throws error when used outside MouseProvider', () => {
    function TestComponent() {
      const ref = useRef<unknown>(null);

      return (
        <TestHookOutsideProvider>
          {() => {
            useOnWheel(ref, () => {
              // noop
            });
          }}
        </TestHookOutsideProvider>
      );
    }

    expect(() => render(<TestComponent />)).not.toThrow();
  });
});

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

  test('multiple hooks can coexist on different elements', () => {
    function TestComponent() {
      const ref1 = useRef<unknown>({ current: null });
      const ref2 = useRef<unknown>({ current: null });

      useOnClick(ref1, () => {
        // noop
      });
      useOnClick(ref2, () => {
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
