import type { MouseEvent as XtermMouseEvent } from 'xterm-mouse';

/**
 * Extended mouse event for Ink components
 * Inherits all properties from xterm-mouse MouseEvent
 */
export type InkMouseEvent = XtermMouseEvent & {
  // Inherits all xterm-mouse properties:
  // x: number - The x coordinate (terminal column)
  // y: number - The y coordinate (terminal row)
  // button: Button type
  // action: Event action type
  // shift: boolean - Shift key modifier
  // alt: boolean - Alt key modifier
  // ctrl: boolean - Ctrl key modifier
  // raw: number - Raw event code
  // data: string - Raw event data
  // protocol: 'SGR' | 'ESC' - Mouse protocol used
};

/**
 * Click event handler
 */
export type ClickHandler = (event: InkMouseEvent) => void;

/**
 * Mouse enter event handler
 */
export type MouseEnterHandler = (event: InkMouseEvent) => void;

/**
 * Mouse leave event handler
 */
export type MouseLeaveHandler = (event: InkMouseEvent) => void;

/**
 * Mouse press event handler
 */
export type MousePressHandler = (event: InkMouseEvent) => void;

/**
 * Mouse release event handler
 */
export type MouseReleaseHandler = (event: InkMouseEvent) => void;

/**
 * Mouse move event handler
 */
export type MouseMoveHandler = (event: InkMouseEvent) => void;

/**
 * Mouse drag event handler
 */
export type MouseDragHandler = (event: InkMouseEvent) => void;

/**
 * Wheel event handler
 */
export type WheelHandler = (event: InkMouseEvent) => void;

/**
 * Universal mouse event handler (all handlers have the same signature)
 */
export type MouseEventHandler = (event: InkMouseEvent) => void;

/**
 * Mouse event type
 */
export type MouseEventType =
  | 'click'
  | 'mouseEnter'
  | 'mouseLeave'
  | 'mousePress'
  | 'mouseRelease'
  | 'mouseMove'
  | 'mouseDrag'
  | 'wheel';
