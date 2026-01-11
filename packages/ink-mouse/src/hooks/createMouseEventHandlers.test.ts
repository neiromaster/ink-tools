/**
 * AAA Tests for createMouseEventHandlers Function
 *
 * Tests event handler creation following Arrange-Act-Assert pattern.
 */

import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { MouseEvent } from 'xterm-mouse';
import { createMockDOMElement } from '../../test/mocks/ink-element';
import type { BoundingClientRect } from '../types';
import type { HandlerEntry } from './createMouseEventHandlers';
import { createMouseEventHandlers } from './createMouseEventHandlers';

type MockGetCachedState = {
  (
    ref: React.RefObject<unknown>,
  ): {
    isHovering: boolean;
    bounds?: BoundingClientRect;
    boundsTimestamp?: number;
  };
  mockImplementation: (
    fn: (ref: React.RefObject<unknown>) => {
      isHovering: boolean;
      bounds?: BoundingClientRect;
      boundsTimestamp?: number;
    },
  ) => void;
};

type MockMouseEvent = MouseEvent & {
  x: number;
  y: number;
};

describe('createMouseEventHandlers - AAA Tests', () => {
  let mockGetCachedState: MockGetCachedState;
  let mockHoverStateRef: WeakMap<React.RefObject<unknown>, { isHovering: boolean; bounds?: BoundingClientRect }>;
  let mockHandlersRef: Map<string, HandlerEntry>;
  let mockElement1: React.RefObject<unknown>;
  let mockElement2: React.RefObject<unknown>;
  let mockClickHandler1: ReturnType<typeof vi.fn>;
  let mockClickHandler2: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock elements
    mockElement1 = { current: createMockDOMElement({ left: 10, top: 10, width: 50, height: 50 }) };
    mockElement2 = { current: createMockDOMElement({ left: 100, top: 100, width: 30, height: 30 }) };

    // Setup mock handlers
    mockClickHandler1 = vi.fn();
    mockClickHandler2 = vi.fn();

    // Setup mock handlers map
    mockHandlersRef = new Map([
      ['handler1', { type: 'click', ref: mockElement1, handler: mockClickHandler1 }],
      ['handler2', { type: 'click', ref: mockElement2, handler: mockClickHandler2 }],
    ]);

    // Setup mock cached state
    mockGetCachedState = vi.fn().mockImplementation((ref: React.RefObject<unknown>) => {
      if (ref === mockElement1) {
        return {
          isHovering: false,
          bounds: { left: 10, top: 11, right: 60, bottom: 61, x: 10, y: 11, width: 50, height: 50 },
        };
      }
      if (ref === mockElement2) {
        return {
          isHovering: false,
          bounds: { left: 100, top: 101, right: 130, bottom: 131, x: 100, y: 101, width: 30, height: 30 },
        };
      }
      return { isHovering: false };
    }) as unknown as MockGetCachedState;

    mockHoverStateRef = new WeakMap();
  });

  describe('Click Handler', () => {
    test('dispatches click to handler when point inside element bounds', () => {
      // Arrange
      const { handleClick } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleClick(mockEvent);

      // Assert
      expect(mockClickHandler1).toHaveBeenCalledWith(mockEvent);
      expect(mockClickHandler2).not.toHaveBeenCalled();
    });

    test('does NOT dispatch click when point outside element bounds', () => {
      // Arrange
      const { handleClick } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 200, y: 200 } as MockMouseEvent;

      // Act
      handleClick(mockEvent);

      // Assert
      expect(mockClickHandler1).not.toHaveBeenCalled();
      expect(mockClickHandler2).not.toHaveBeenCalled();
    });

    test('dispatches to multiple handlers with overlapping bounds', () => {
      // Arrange
      const overlappingElement = { current: createMockDOMElement({ left: 15, top: 15, width: 50, height: 50 }) };
      const overlappingHandler = vi.fn();
      mockHandlersRef.set('handler3', { type: 'click', ref: overlappingElement, handler: overlappingHandler });

      mockGetCachedState.mockImplementation((ref: React.RefObject<unknown>) => {
        if (ref === mockElement1) {
          return {
            isHovering: false,
            bounds: { left: 10, top: 11, right: 60, bottom: 61, x: 10, y: 11, width: 50, height: 50 },
          };
        }
        if (ref === overlappingElement) {
          return {
            isHovering: false,
            bounds: { left: 15, top: 16, right: 65, bottom: 66, x: 15, y: 16, width: 50, height: 50 },
          };
        }
        return { isHovering: false };
      });

      const { handleClick } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 20, y: 20 } as MockMouseEvent;

      // Act
      handleClick(mockEvent);

      // Assert - point (20, 20) is in both element bounds
      expect(mockClickHandler1).toHaveBeenCalledWith(mockEvent);
      expect(overlappingHandler).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Wheel Handler', () => {
    test('dispatches wheel event when point inside bounds', () => {
      // Arrange
      mockHandlersRef.clear();
      mockHandlersRef.set('wheel1', { type: 'wheel', ref: mockElement1, handler: mockClickHandler1 });
      const { handleWheel } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleWheel(mockEvent);

      // Assert
      expect(mockClickHandler1).toHaveBeenCalledWith(mockEvent);
    });

    test('does NOT dispatch wheel when point outside bounds', () => {
      // Arrange
      mockHandlersRef.clear();
      mockHandlersRef.set('wheel1', { type: 'wheel', ref: mockElement1, handler: mockClickHandler1 });
      const { handleWheel } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 200, y: 200 } as MockMouseEvent;

      // Act
      handleWheel(mockEvent);

      // Assert
      expect(mockClickHandler1).not.toHaveBeenCalled();
    });
  });

  describe('Move Handler - mouseMove Events', () => {
    test('dispatches mouseMove when point inside bounds', () => {
      // Arrange
      mockHandlersRef.clear();
      mockHandlersRef.set('move1', { type: 'mouseMove', ref: mockElement1, handler: mockClickHandler1 });
      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert
      expect(mockClickHandler1).toHaveBeenCalledWith(mockEvent);
    });

    test('does NOT dispatch mouseMove when point outside bounds', () => {
      // Arrange
      mockHandlersRef.clear();
      mockHandlersRef.set('move1', { type: 'mouseMove', ref: mockElement1, handler: mockClickHandler1 });
      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 200, y: 200 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert
      expect(mockClickHandler1).not.toHaveBeenCalled();
    });
  });

  describe('Move Handler - mouseEnter Events', () => {
    test('fires mouseEnter when mouse enters element bounds', () => {
      // Arrange
      const enterHandler = vi.fn();
      mockHandlersRef.clear();
      mockHandlersRef.set('enter1', { type: 'mouseEnter', ref: mockElement1, handler: enterHandler });

      const mockState = {
        isHovering: false,
        bounds: { left: 10, top: 11, right: 60, bottom: 61, x: 10, y: 11, width: 50, height: 50 },
      };
      mockGetCachedState.mockImplementation((ref: React.RefObject<unknown>) => {
        if (ref === mockElement1) {
          return mockState;
        }
        return { isHovering: false };
      });
      mockHoverStateRef.set(mockElement1, mockState);

      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert
      expect(enterHandler).toHaveBeenCalledWith(mockEvent);
      expect(mockState.isHovering).toBe(true);
    });

    test('does NOT fire mouseEnter when already hovering', () => {
      // Arrange
      const enterHandler = vi.fn();
      mockHandlersRef.clear();
      mockHandlersRef.set('enter1', { type: 'mouseEnter', ref: mockElement1, handler: enterHandler });

      const mockState = {
        isHovering: true,
        bounds: { left: 10, top: 11, right: 60, bottom: 61, x: 10, y: 11, width: 50, height: 50 },
      };
      mockGetCachedState.mockImplementation((ref: React.RefObject<unknown>) => {
        if (ref === mockElement1) {
          return mockState;
        }
        return { isHovering: false };
      });
      mockHoverStateRef.set(mockElement1, mockState);

      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert - already hovering, should not fire again
      expect(enterHandler).not.toHaveBeenCalled();
    });

    test('does NOT fire mouseEnter when mouse leaves element', () => {
      // Arrange
      const enterHandler = vi.fn();
      mockHandlersRef.clear();
      mockHandlersRef.set('enter1', { type: 'mouseEnter', ref: mockElement1, handler: enterHandler });

      const mockState = {
        isHovering: true,
        bounds: { left: 10, top: 11, right: 60, bottom: 61, x: 10, y: 11, width: 50, height: 50 },
      };
      mockGetCachedState.mockImplementation((ref: React.RefObject<unknown>) => {
        if (ref === mockElement1) {
          return mockState;
        }
        return { isHovering: false };
      });
      mockHoverStateRef.set(mockElement1, mockState);

      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 200, y: 200 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert - mouse left element, isHovering updated but handler NOT called
      expect(enterHandler).not.toHaveBeenCalled();
      expect(mockState.isHovering).toBe(false);
    });
  });

  describe('Move Handler - mouseLeave Events', () => {
    test('fires mouseLeave when mouse exits element bounds', () => {
      // Arrange
      const leaveHandler = vi.fn();
      mockHandlersRef.clear();
      mockHandlersRef.set('leave1', { type: 'mouseLeave', ref: mockElement1, handler: leaveHandler });

      const mockState = {
        isHovering: true,
        bounds: { left: 10, top: 11, right: 60, bottom: 61, x: 10, y: 11, width: 50, height: 50 },
      };
      mockGetCachedState.mockImplementation((ref: React.RefObject<unknown>) => {
        if (ref === mockElement1) {
          return mockState;
        }
        return { isHovering: false };
      });
      mockHoverStateRef.set(mockElement1, mockState);

      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 200, y: 200 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert
      expect(leaveHandler).toHaveBeenCalledWith(mockEvent);
      expect(mockState.isHovering).toBe(false);
    });

    test('does NOT fire mouseLeave when not hovering', () => {
      // Arrange
      const leaveHandler = vi.fn();
      mockHandlersRef.clear();
      mockHandlersRef.set('leave1', { type: 'mouseLeave', ref: mockElement1, handler: leaveHandler });

      const mockState = {
        isHovering: false,
        bounds: { left: 10, top: 11, right: 60, bottom: 61, x: 10, y: 11, width: 50, height: 50 },
      };
      mockGetCachedState.mockImplementation((ref: React.RefObject<unknown>) => {
        if (ref === mockElement1) {
          return mockState;
        }
        return { isHovering: false };
      });
      mockHoverStateRef.set(mockElement1, mockState);

      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 200, y: 200 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert - not hovering, should not fire leave
      expect(leaveHandler).not.toHaveBeenCalled();
    });

    test('does NOT fire mouseLeave when mouse enters element', () => {
      // Arrange
      const leaveHandler = vi.fn();
      mockHandlersRef.clear();
      mockHandlersRef.set('leave1', { type: 'mouseLeave', ref: mockElement1, handler: leaveHandler });

      const mockState = {
        isHovering: false,
        bounds: { left: 10, top: 11, right: 60, bottom: 61, x: 10, y: 11, width: 50, height: 50 },
      };
      mockGetCachedState.mockImplementation((ref: React.RefObject<unknown>) => {
        if (ref === mockElement1) {
          return mockState;
        }
        return { isHovering: false };
      });
      mockHoverStateRef.set(mockElement1, mockState);

      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert - mouse entered element, isHovering updated but handler NOT called
      expect(leaveHandler).not.toHaveBeenCalled();
      expect(mockState.isHovering).toBe(true);
    });

    test('ignores click handlers when handleMove is called', () => {
      // Arrange
      const clickHandler = vi.fn();
      mockHandlersRef.clear();
      mockHandlersRef.set('click1', { type: 'click', ref: mockElement1, handler: clickHandler });

      const mockState = {
        isHovering: false,
        bounds: { left: 10, top: 11, right: 60, bottom: 61, x: 10, y: 11, width: 50, height: 50 },
      };
      mockGetCachedState.mockImplementation((ref: React.RefObject<unknown>) => {
        if (ref === mockElement1) {
          return mockState;
        }
        return { isHovering: false };
      });
      mockHoverStateRef.set(mockElement1, mockState);

      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert - click handler should NOT be called by handleMove (switch default case)
      expect(clickHandler).not.toHaveBeenCalled();
    });
  });

  describe('Press/Release/Drag Handlers', () => {
    test('dispatches mousePress when point inside bounds', () => {
      // Arrange
      mockHandlersRef.clear();
      mockHandlersRef.set('press1', { type: 'mousePress', ref: mockElement1, handler: mockClickHandler1 });
      const { handlePress } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handlePress(mockEvent);

      // Assert
      expect(mockClickHandler1).toHaveBeenCalledWith(mockEvent);
    });

    test('dispatches mouseRelease when point inside bounds', () => {
      // Arrange
      mockHandlersRef.clear();
      mockHandlersRef.set('release1', { type: 'mouseRelease', ref: mockElement1, handler: mockClickHandler1 });
      const { handleRelease } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleRelease(mockEvent);

      // Assert
      expect(mockClickHandler1).toHaveBeenCalledWith(mockEvent);
    });

    test('dispatches mouseDrag when point inside bounds', () => {
      // Arrange
      mockHandlersRef.clear();
      mockHandlersRef.set('drag1', { type: 'mouseDrag', ref: mockElement1, handler: mockClickHandler1 });
      const { handleDrag } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleDrag(mockEvent);

      // Assert
      expect(mockClickHandler1).toHaveBeenCalledWith(mockEvent);
    });
  });

  describe('Return Values', () => {
    test('returns all handler functions', () => {
      // Arrange & Act
      const handlers = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);

      // Assert
      expect(handlers).toHaveProperty('handleClick');
      expect(handlers).toHaveProperty('handleMove');
      expect(handlers).toHaveProperty('handleWheel');
      expect(handlers).toHaveProperty('handlePress');
      expect(handlers).toHaveProperty('handleRelease');
      expect(handlers).toHaveProperty('handleDrag');
      expect(typeof handlers.handleClick).toBe('function');
      expect(typeof handlers.handleMove).toBe('function');
      expect(typeof handlers.handleWheel).toBe('function');
      expect(typeof handlers.handlePress).toBe('function');
      expect(typeof handlers.handleRelease).toBe('function');
      expect(typeof handlers.handleDrag).toBe('function');
    });
  });

  describe('Edge Cases', () => {
    test('handles handlers with null bounds gracefully', () => {
      // Arrange
      mockGetCachedState.mockImplementation(() => ({ isHovering: false }));
      mockHandlersRef.clear();
      mockHandlersRef.set('noBounds', { type: 'click', ref: mockElement1, handler: mockClickHandler1 });

      const { handleClick } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act & Assert - should not throw
      expect(() => handleClick(mockEvent)).not.toThrow();
      expect(mockClickHandler1).not.toHaveBeenCalled();
    });

    test('handles empty handlers map', () => {
      // Arrange
      const emptyMap = new Map();
      const { handleClick } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, emptyMap);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act & Assert - should not throw
      expect(() => handleClick(mockEvent)).not.toThrow();
    });

    test('ignores handlers with non-matching types', () => {
      // Arrange
      mockHandlersRef.clear();
      mockHandlersRef.set('wheelHandler', { type: 'wheel', ref: mockElement1, handler: mockClickHandler1 });
      const { handleClick } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleClick(mockEvent);

      // Assert - wheel handler should NOT be called for click event
      expect(mockClickHandler1).not.toHaveBeenCalled();
    });

    test('handleMove ignores mouseMove handlers with null bounds', () => {
      // Arrange
      const moveHandler = vi.fn();
      mockHandlersRef.clear();
      mockHandlersRef.set('move1', { type: 'mouseMove', ref: mockElement1, handler: moveHandler });

      // Mock get cached state to return null bounds for handleMove
      mockGetCachedState.mockImplementation((ref: React.RefObject<unknown>) => {
        if (ref === mockElement1) {
          return { isHovering: false };
        }
        return { isHovering: false };
      });
      mockHoverStateRef.set(mockElement1, { isHovering: false });

      const { handleMove } = createMouseEventHandlers(mockGetCachedState, mockHoverStateRef, mockHandlersRef);
      const mockEvent: MockMouseEvent = { x: 15, y: 15 } as MockMouseEvent;

      // Act
      handleMove(mockEvent);

      // Assert - handler should NOT be called when bounds are null
      expect(moveHandler).not.toHaveBeenCalled();
    });
  });
});
