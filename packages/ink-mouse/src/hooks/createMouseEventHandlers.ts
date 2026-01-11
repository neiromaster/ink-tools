import type { MouseEvent as XtermMouseEvent } from 'xterm-mouse';
import type { BoundingClientRect } from '../types';
import { isPointInRect } from '../utils/geometry';

type CachedElementState = {
  isHovering: boolean;
  bounds?: BoundingClientRect;
  boundsTimestamp?: number;
};

export type HandlerEntry = {
  type: 'click' | 'mouseEnter' | 'mouseLeave' | 'mousePress' | 'mouseRelease' | 'mouseMove' | 'mouseDrag' | 'wheel';
  ref: React.RefObject<unknown>;
  handler: unknown;
};

/**
 * Creates mouse event handlers for dispatching events to registered handlers
 *
 * Creates optimized event handlers that iterate through registered handlers
 * and dispatch events based on element bounds and hover state.
 *
 * This is a plain function (not a hook) because handlers are registered once
 * with the Mouse instance and don't need to be reactive.
 *
 * @param getCachedState - Function to get cached element bounds
 * @param hoverStateRef - Ref to WeakMap storing hover state per element
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
  hoverStateRef: WeakMap<React.RefObject<unknown>, CachedElementState>,
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
    (eventType: 'click' | 'wheel' | 'mousePress' | 'mouseRelease' | 'mouseMove' | 'mouseDrag') =>
    (event: XtermMouseEvent): void => {
      const { x, y } = event;

      handlersRef.forEach((entry) => {
        if (entry.type !== eventType) return;

        const cached = getCachedState(entry.ref);
        if (!cached.bounds) return;

        if (isPointInRect(x, y, cached.bounds)) {
          (entry.handler as (event: XtermMouseEvent) => void)(event);
        }
      });
    };

  // Move event handler (for hover and mouse move)
  const handleMove = (event: XtermMouseEvent): void => {
    const { x, y } = event;

    // Handle all event types in a single pass
    handlersRef.forEach((entry) => {
      const cached = getCachedState(entry.ref);

      if (!cached.bounds) return;

      const isInside = isPointInRect(x, y, cached.bounds);

      switch (entry.type) {
        case 'mouseMove':
          if (isInside) {
            (entry.handler as (event: XtermMouseEvent) => void)(event);
          }
          break;

        case 'mouseEnter':
          if (isInside !== cached.isHovering) {
            cached.isHovering = isInside;
            hoverStateRef.set(entry.ref, cached);
            if (isInside) {
              (entry.handler as (event: XtermMouseEvent) => void)(event);
            }
          }
          break;

        case 'mouseLeave':
          if (isInside !== cached.isHovering) {
            cached.isHovering = isInside;
            hoverStateRef.set(entry.ref, cached);
            if (!isInside) {
              (entry.handler as (event: XtermMouseEvent) => void)(event);
            }
          }
          break;

        default:
          break;
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
