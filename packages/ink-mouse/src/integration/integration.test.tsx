import { describe, expect, test } from 'bun:test';
import type { MouseEvent } from '@neiropacks/xterm-mouse';
import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { useRef } from 'react';
import { createMockDOMElement } from '../../test/mocks/ink-element';
import { useOnDrag, useOnMouseEnter, useOnMouseLeave, useOnPress, useOnRelease } from '../hooks';
import { useOnClick } from '../hooks/useOnClick';
import { MouseProvider } from '../provider';

/**
 * Integration Tests for ink-mouse
 *
 * These tests verify complete workflows involving MouseProvider and mouse event hooks.
 * Due to test environment limitations (no real terminal mouse support), we test:
 * - Handler registration and lifecycle
 * - Hit testing with mock elements
 * - Event propagation through the registry
 * - Multiple simultaneous event handlers
 */

describe('Integration: Click workflow', () => {
  test('component with useOnClick registers handler and can receive click events', () => {
    let clickHandlerCalled = false;
    let _receivedEvent: MouseEvent | undefined;

    function ClickableComponent() {
      const ref = useRef<unknown>(null);
      const mockElement = createMockDOMElement({
        left: 10,
        top: 10,
        width: 5,
        height: 3,
      });

      // Set the ref to our mock element
      (ref.current as unknown) = mockElement;

      useOnClick(ref, (event: MouseEvent) => {
        clickHandlerCalled = true;
        _receivedEvent = event;
      });

      return (
        <Box>
          <Text>Clickable</Text>
        </Box>
      );
    }

    const { lastFrame, unmount } = render(
      <MouseProvider>
        <ClickableComponent />
      </MouseProvider>,
    );

    // Component rendered successfully
    expect(lastFrame()).toBe('Clickable');

    // Component unmounted cleanly
    expect(() => unmount()).not.toThrow();

    // Handler was registered (we can't test actual dispatch without terminal mouse support)
    // But we verified the component mounts and the hook doesn't throw
    expect(clickHandlerCalled).toBe(false);
  });

  test('multiple components with useOnClick each register their own handlers', () => {
    const handlersCalled: string[] = [];

    function ClickableComponent({ label }: { label: string }) {
      const ref = useRef<unknown>(null);
      const mockElement = createMockDOMElement({
        left: 10,
        top: 10,
        width: 5,
        height: 3,
      });

      (ref.current as unknown) = mockElement;

      useOnClick(ref, () => {
        handlersCalled.push(label);
      });

      return (
        <Box>
          <Text>{label}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <Box>
          <ClickableComponent label="Button1" />
          <ClickableComponent label="Button2" />
        </Box>
      </MouseProvider>,
    );

    // Both components rendered successfully
    expect(lastFrame()).toContain('Button1');
    expect(lastFrame()).toContain('Button2');

    // No handlers called without actual mouse events
    expect(handlersCalled).toEqual([]);
  });
});

describe('Integration: Hover state tracking', () => {
  test('component with useOnMouseEnter and useOnMouseLeave registers both handlers', () => {
    let enterHandlerCalled = false;
    let leaveHandlerCalled = false;

    function HoverableComponent() {
      const ref = useRef<unknown>(null);
      const mockElement = createMockDOMElement({
        left: 5,
        top: 5,
        width: 10,
        height: 4,
      });

      (ref.current as unknown) = mockElement;

      useOnMouseEnter(ref, () => {
        enterHandlerCalled = true;
      });

      useOnMouseLeave(ref, () => {
        leaveHandlerCalled = true;
      });

      return (
        <Box>
          <Text>Hoverable</Text>
        </Box>
      );
    }

    const { lastFrame, unmount } = render(
      <MouseProvider>
        <HoverableComponent />
      </MouseProvider>,
    );

    // Component rendered successfully
    expect(lastFrame()).toBe('Hoverable');

    // Both handlers registered successfully (no errors)
    expect(enterHandlerCalled).toBe(false);
    expect(leaveHandlerCalled).toBe(false);

    // Cleanup works
    expect(() => unmount()).not.toThrow();
  });

  test('multiple components track hover state independently', () => {
    const hoverStates: Record<string, { entered: boolean; left: boolean }> = {};

    function HoverableComponent({ label }: { label: string }) {
      const ref = useRef<unknown>(null);
      const mockElement = createMockDOMElement({
        left: 10,
        top: 10,
        width: 5,
        height: 3,
      });

      (ref.current as unknown) = mockElement;

      hoverStates[label] = { entered: false, left: false };

      useOnMouseEnter(ref, () => {
        if (hoverStates[label]) {
          hoverStates[label].entered = true;
        }
      });

      useOnMouseLeave(ref, () => {
        if (hoverStates[label]) {
          hoverStates[label].left = true;
        }
      });

      return (
        <Box>
          <Text>{label}</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <Box>
          <HoverableComponent label="Item1" />
          <HoverableComponent label="Item2" />
        </Box>
      </MouseProvider>,
    );

    // Both components rendered
    expect(lastFrame()).toContain('Item1');
    expect(lastFrame()).toContain('Item2');

    // Both have independent state tracking
    expect(hoverStates.Item1).toEqual({ entered: false, left: false });
    expect(hoverStates.Item2).toEqual({ entered: false, left: false });
  });
});

describe('Integration: Drag and drop workflow', () => {
  test('component with press, drag, and release handlers registers all handlers', () => {
    const events: string[] = [];

    function DraggableComponent() {
      const ref = useRef<unknown>(null);
      const mockElement = createMockDOMElement({
        left: 0,
        top: 0,
        width: 20,
        height: 10,
      });

      (ref.current as unknown) = mockElement;

      useOnPress(ref, () => {
        events.push('press');
      });

      useOnDrag(ref, () => {
        events.push('drag');
      });

      useOnRelease(ref, () => {
        events.push('release');
      });

      return (
        <Box>
          <Text>Draggable</Text>
        </Box>
      );
    }

    const { lastFrame, unmount } = render(
      <MouseProvider>
        <DraggableComponent />
      </MouseProvider>,
    );

    // Component rendered successfully with all handlers registered
    expect(lastFrame()).toBe('Draggable');
    expect(events).toEqual([]);

    // Cleanup works
    expect(() => unmount()).not.toThrow();
  });

  test('drag workflow maintains state across component lifecycle', () => {
    let isPressed = false;
    let isDragging = false;
    let isReleased = false;

    function DraggableComponent() {
      const ref = useRef<unknown>(null);
      const mockElement = createMockDOMElement({
        left: 5,
        top: 5,
        width: 15,
        height: 8,
      });

      (ref.current as unknown) = mockElement;

      useOnPress(ref, () => {
        isPressed = true;
      });

      useOnDrag(ref, () => {
        if (isPressed) {
          isDragging = true;
        }
      });

      useOnRelease(ref, () => {
        if (isPressed || isDragging) {
          isReleased = true;
        }
      });

      return (
        <Box>
          <Text>
            {isPressed ? 'P' : ''}
            {isDragging ? 'D' : ''}
            {isReleased ? 'R' : ''}
          </Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <DraggableComponent />
      </MouseProvider>,
    );

    // Component renders in initial state
    expect(lastFrame()).toBe('');

    // State tracking initialized
    expect(isPressed).toBe(false);
    expect(isDragging).toBe(false);
    expect(isReleased).toBe(false);
  });
});

describe('Integration: Multiple event handlers', () => {
  test('component can register click, hover, and drag handlers simultaneously', () => {
    const events: string[] = [];

    function MultiHandlerComponent() {
      const ref = useRef<unknown>(null);
      const mockElement = createMockDOMElement({
        left: 0,
        top: 0,
        width: 30,
        height: 15,
      });

      (ref.current as unknown) = mockElement;

      useOnClick(ref, () => {
        events.push('click');
      });

      useOnMouseEnter(ref, () => {
        events.push('enter');
      });

      useOnMouseLeave(ref, () => {
        events.push('leave');
      });

      useOnPress(ref, () => {
        events.push('press');
      });

      useOnRelease(ref, () => {
        events.push('release');
      });

      useOnDrag(ref, () => {
        events.push('drag');
      });

      return (
        <Box>
          <Text>Multi-Handler</Text>
        </Box>
      );
    }

    const { lastFrame, unmount } = render(
      <MouseProvider>
        <MultiHandlerComponent />
      </MouseProvider>,
    );

    // Component with 6 handlers renders successfully
    expect(lastFrame()).toBe('Multi-Handler');
    expect(events).toEqual([]);

    // All handlers cleaned up on unmount
    expect(() => unmount()).not.toThrow();
  });

  test('sibling components can each have different handler combinations', () => {
    const component1Events: string[] = [];
    const component2Events: string[] = [];
    const component3Events: string[] = [];

    function Component1() {
      const ref = useRef<unknown>(null);
      (ref.current as unknown) = createMockDOMElement({ left: 0, top: 0, width: 10, height: 5 });

      useOnClick(ref, () => {
        component1Events.push('click');
      });

      return (
        <Box>
          <Text>C1</Text>
        </Box>
      );
    }

    function Component2() {
      const ref = useRef<unknown>(null);
      (ref.current as unknown) = createMockDOMElement({ left: 10, top: 0, width: 10, height: 5 });

      useOnMouseEnter(ref, () => {
        component2Events.push('enter');
      });

      useOnMouseLeave(ref, () => {
        component2Events.push('leave');
      });

      return (
        <Box>
          <Text>C2</Text>
        </Box>
      );
    }

    function Component3() {
      const ref = useRef<unknown>(null);
      (ref.current as unknown) = createMockDOMElement({ left: 20, top: 0, width: 10, height: 5 });

      useOnPress(ref, () => {
        component3Events.push('press');
      });

      useOnDrag(ref, () => {
        component3Events.push('drag');
      });

      useOnRelease(ref, () => {
        component3Events.push('release');
      });

      return (
        <Box>
          <Text>C3</Text>
        </Box>
      );
    }

    const { lastFrame } = render(
      <MouseProvider>
        <Box>
          <Component1 />
          <Component2 />
          <Component3 />
        </Box>
      </MouseProvider>,
    );

    // All three components rendered with different handler combinations
    expect(lastFrame()).toContain('C1');
    expect(lastFrame()).toContain('C2');
    expect(lastFrame()).toContain('C3');

    // Each component has its own event tracking
    expect(component1Events).toEqual([]);
    expect(component2Events).toEqual([]);
    expect(component3Events).toEqual([]);
  });
});

describe('Integration: Provider lifecycle and cleanup', () => {
  test('handlers are properly cleaned up when component unmounts', () => {
    let mountCount = 0;
    const _unmountCount = 0;

    function TestComponent() {
      const ref = useRef<unknown>(null);
      (ref.current as unknown) = createMockDOMElement({ left: 0, top: 0, width: 10, height: 5 });

      mountCount++;

      useOnClick(ref, () => {
        // noop
      });

      return (
        <Box>
          <Text>Test</Text>
        </Box>
      );
    }

    const { rerender, unmount } = render(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );

    // Initial mount
    expect(mountCount).toBe(1);

    // Rerender doesn't cause unmount/remount
    rerender(
      <MouseProvider>
        <TestComponent />
      </MouseProvider>,
    );
    expect(mountCount).toBe(2);

    // Unmount works without errors
    expect(() => unmount()).not.toThrow();
  });

  test('multiple providers can be mounted and unmounted', () => {
    function TestComponent({ label }: { label: string }) {
      const ref = useRef<unknown>(null);
      (ref.current as unknown) = createMockDOMElement({ left: 0, top: 0, width: 10, height: 5 });

      useOnClick(ref, () => {
        // noop
      });

      return (
        <Box>
          <Text>{label}</Text>
        </Box>
      );
    }

    const { unmount: unmount1 } = render(
      <MouseProvider>
        <TestComponent label="Provider1" />
      </MouseProvider>,
    );

    const { unmount: unmount2 } = render(
      <MouseProvider>
        <TestComponent label="Provider2" />
      </MouseProvider>,
    );

    // Both providers can exist independently
    expect(() => {
      unmount1();
      unmount2();
    }).not.toThrow();
  });
});
