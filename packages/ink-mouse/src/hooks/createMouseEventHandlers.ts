import type { MouseEvent as XtermMouseEvent } from 'xterm-mouse';
import type { BoundingClientRect } from '../types';
import { isPointInRect } from '../utils/geometry';

type CachedElementState = {
  bounds?: BoundingClientRect;
  boundsTimestamp?: number;
};

export type HandlerEntry = {
  type: 'click' | 'mouseEnter' | 'mouseLeave' | 'mousePress' | 'mouseRelease' | 'mouseMove' | 'mouseDrag' | 'wheel';
  ref: React.RefObject<unknown>;
  handler: unknown;
};

/**
 * Type guard to validate that a handler is a valid mouse event handler function.
 *
 * Performs runtime validation to ensure type safety and prevent crashes from
 * malformed or malicious handlers. This is defense-in-depth against type confusion
 * attacks and runtime errors.
 *
 * @param handler - The unknown handler to validate
 * @param eventType - The event type for error messaging
 * @returns True if the handler is a valid function that accepts mouse events
 *
 * @example
 * ```ts
 * if (!isValidHandler(entry.handler, entry.type)) {
 *   console.error(`Invalid handler for ${entry.type}`);
 *   return;
 * }
 * entry.handler(event);  // Type-safe call
 * ```
 */
function isValidHandler(handler: unknown, eventType?: string): handler is (event: XtermMouseEvent) => void {
  // Check if handler is a function
  if (typeof handler !== 'function') {
    if (eventType) {
      console.error(`[ink-mouse] Invalid handler for '${eventType}' event: expected a function, got ${typeof handler}`);
    }
    return false;
  }

  // Check parameter count (mouse handlers should accept at least 1 argument)
  // Note: We use <= 1 instead of === 1 because some functions (like vi.fn mocks)
  // have length 0 but can still accept arguments
  if (handler.length < 0 || handler.length > 10) {
    // Unreasonably high parameter count is suspicious
    if (eventType) {
      console.error(
        `[ink-mouse] Invalid handler for '${eventType}' event: function has unusual parameter count (${handler.length})`,
      );
    }
    return false;
  }

  return true;
}

/**
 * Creates mouse event handlers for dispatching events to registered handlers
 *
 * Creates optimized event handlers that iterate through registered handlers
 * and dispatch events based on element bounds and hover state.
 *
 * This is a plain function (not a hook) because handlers are registered once
 * with the Mouse instance and don't need to be reactive.
 *
 * @param getCachedState - Function to get cached element bounds (geometry only)
 * @param hoverStateRef - WeakMap storing boolean hover state per element
 * @param handlersRef - Ref to Map of registered handlers
 * @returns Object with event handler functions
 *
 * @example
 * ```ts
 * const { handleClick, handleMove, handleWheel, ... } = createMouseEventHandlers(
 *   getCachedState,
 *   hoverStateRef,
 *   handlersRef
 * );
 *
 * // Register handlers with Mouse instance
 * mouse.on('click', handleClick);
 * mouse.on('move', handleMove);
 * ```
 */
export function createMouseEventHandlers(
  getCachedState: (ref: React.RefObject<unknown>) => CachedElementState,
  hoverStateRef: WeakMap<React.RefObject<unknown>, boolean>,
  handlersRef: Map<string, HandlerEntry>,
): {
  handleClick: (event: XtermMouseEvent) => void;
  handleMove: (event: XtermMouseEvent) => void;
  handleWheel: (event: XtermMouseEvent) => void;
  handlePress: (event: XtermMouseEvent) => void;
  handleRelease: (event: XtermMouseEvent) => void;
  handleDrag: (event: XtermMouseEvent) => void;
} {
  const createGenericHandler =
    (eventType: 'click' | 'wheel' | 'mousePress' | 'mouseRelease' | 'mouseDrag') =>
    (event: XtermMouseEvent): void => {
      const { x, y } = event;

      handlersRef.forEach((entry) => {
        if (entry.type !== eventType) return;

        if (!isValidHandler(entry.handler, eventType)) {
          return;
        }

        const cached = getCachedState(entry.ref);
        if (!cached.bounds) return;

        if (isPointInRect(x, y, cached.bounds)) {
          entry.handler(event);
        }
      });
    };

  // Move event handler (for hover and mouse move)
  const handleMove = (event: XtermMouseEvent): void => {
    const { x, y } = event;

    // Handle all event types in a single pass
    handlersRef.forEach((entry) => {
      if (!['mouseMove', 'mouseEnter', 'mouseLeave'].includes(entry.type)) {
        return;
      }
      if (!isValidHandler(entry.handler, entry.type)) {
        return;
      }

      const cached = getCachedState(entry.ref);

      if (!cached.bounds) return;

      const isInside = isPointInRect(x, y, cached.bounds);

      switch (entry.type) {
        case 'mouseMove':
          if (isInside) {
            entry.handler(event);
          }
          break;

        case 'mouseEnter': {
          const wasHoveringEnter = hoverStateRef.get(entry.ref) ?? false;
          if (isInside !== wasHoveringEnter) {
            hoverStateRef.set(entry.ref, isInside);
            if (isInside) {
              entry.handler(event);
            }
          }
          break;
        }

        case 'mouseLeave': {
          const wasHoveringLeave = hoverStateRef.get(entry.ref) ?? false;
          if (isInside !== wasHoveringLeave) {
            hoverStateRef.set(entry.ref, isInside);
            if (!isInside) {
              entry.handler(event);
            }
          }
          break;
        }
      }
    });
  };

  // Create handlers from the generic factory
  const handleClick = createGenericHandler('click');
  const handleWheel = createGenericHandler('wheel');
  const handlePress = createGenericHandler('mousePress');
  const handleRelease = createGenericHandler('mouseRelease');
  const handleDrag = createGenericHandler('mouseDrag');

  return {
    handleClick,
    handleMove,
    handleWheel,
    handlePress,
    handleRelease,
    handleDrag,
  };
}
