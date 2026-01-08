import type { MouseEvent as XtermMouseEvent } from 'xterm-mouse';
import type { InkMouseEvent } from '../../src/types';

/**
 * Create a mock xterm-mouse MouseEvent for testing
 *
 * @param props - Partial event properties to override defaults
 * @returns A mock MouseEvent object
 *
 * @example
 * ```ts
 * const event = createMockXtermMouseEvent({
 *   x: 10,
 *   y: 20,
 *   button: 'left',
 * });
 * ```
 */
export function createMockXtermMouseEvent(props: Partial<XtermMouseEvent> = {}): XtermMouseEvent {
  return {
    x: 1,
    y: 1,
    button: 'left',
    action: 'press',
    shift: false,
    alt: false,
    ctrl: false,
    raw: 0,
    data: '',
    protocol: 'ESC',
    ...props,
  };
}

/**
 * Create a mock InkMouseEvent for testing
 *
 * InkMouseEvent extends xterm-mouse MouseEvent with all the same properties
 * This is just a type alias for convenience
 *
 * @param props - Partial event properties to override defaults
 * @returns A mock InkMouseEvent object
 *
 * @example
 * ```ts
 * const event = createMockInkMouseEvent({
 *   x: 15,
 *   y: 25,
 *   action: 'click',
 * });
 * ```
 */
export function createMockInkMouseEvent(props: Partial<InkMouseEvent> = {}): InkMouseEvent {
  return createMockXtermMouseEvent(props) as InkMouseEvent;
}

/**
 * Create a mock click event at specific coordinates
 *
 * @param x - X coordinate (column)
 * @param y - Y coordinate (row)
 * @param button - Mouse button (default: 'left')
 * @returns A mock click event
 */
export function createMockClickEvent(x: number, y: number, button: XtermMouseEvent['button'] = 'left'): InkMouseEvent {
  return createMockInkMouseEvent({ x, y, button, action: 'click' });
}

/**
 * Create a mock mouse press event at specific coordinates
 *
 * @param x - X coordinate (column)
 * @param y - Y coordinate (row)
 * @param button - Mouse button (default: 'left')
 * @returns A mock press event
 */
export function createMockPressEvent(x: number, y: number, button: XtermMouseEvent['button'] = 'left'): InkMouseEvent {
  return createMockInkMouseEvent({ x, y, button, action: 'press' });
}

/**
 * Create a mock mouse release event at specific coordinates
 *
 * @param x - X coordinate (column)
 * @param y - Y coordinate (row)
 * @param button - Mouse button (default: 'left')
 * @returns A mock release event
 */
export function createMockReleaseEvent(
  x: number,
  y: number,
  button: XtermMouseEvent['button'] = 'left',
): InkMouseEvent {
  return createMockInkMouseEvent({ x, y, button, action: 'release' });
}

/**
 * Create a mock mouse move event at specific coordinates
 *
 * @param x - X coordinate (column)
 * @param y - Y coordinate (row)
 * @returns A mock move event
 */
export function createMockMoveEvent(x: number, y: number): InkMouseEvent {
  return createMockInkMouseEvent({ x, y, action: 'move' });
}

/**
 * Create a mock mouse drag event at specific coordinates
 *
 * @param x - X coordinate (column)
 * @param y - Y coordinate (row)
 * @param button - Mouse button (default: 'left')
 * @returns A mock drag event
 */
export function createMockDragEvent(x: number, y: number, button: XtermMouseEvent['button'] = 'left'): InkMouseEvent {
  return createMockInkMouseEvent({ x, y, button, action: 'drag' });
}

/**
 * Create a mock wheel event at specific coordinates
 *
 * @param x - X coordinate (column)
 * @param y - Y coordinate (row)
 * @returns A mock wheel event
 */
export function createMockWheelEvent(x: number, y: number): InkMouseEvent {
  return createMockInkMouseEvent({ x, y, action: 'wheel' });
}
