import type { MouseEvent as XtermMouseEvent } from '@neiropacks/xterm-mouse';
import type { RefObject } from 'react';

/**
 * DOMRect type - browser standard for element bounding box
 */
export type DOMRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
};

/**
 * Alias for DOMRect - used for element bounding client rectangle
 */
export type BoundingClientRect = DOMRect;

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
 * Wheel event handler
 */
export type WheelHandler = (event: InkMouseEvent) => void;

/**
 * Mouse context value exposed by MouseProvider
 */
export type MouseContextValue = {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  isTracking: boolean;
};

/**
 * Element ref type
 */
export type ElementRef = RefObject<unknown>;

/**
 * Handler entry for click events in registry
 */
export type ClickHandlerEntry = {
  id: string;
  ref: ElementRef;
  handler: ClickHandler;
};

/**
 * Handler entry for mouse enter events in registry
 */
export type MouseEnterHandlerEntry = {
  id: string;
  ref: ElementRef;
  handler: MouseEnterHandler;
};

/**
 * Handler entry for mouse leave events in registry
 */
export type MouseLeaveHandlerEntry = {
  id: string;
  ref: ElementRef;
  handler: MouseLeaveHandler;
};

/**
 * Handler entry for wheel events in registry
 */
export type WheelHandlerEntry = {
  id: string;
  ref: ElementRef;
  handler: WheelHandler;
};

/**
 * Handler registry for all event types
 */
export type HandlerRegistry = {
  click: Map<string, ClickHandlerEntry>;
  mouseEnter: Map<string, MouseEnterHandlerEntry>;
  mouseLeave: Map<string, MouseLeaveHandlerEntry>;
  wheel: Map<string, WheelHandlerEntry>;
};

/**
 * Registry context value for internal use by hooks
 */
export type MouseRegistryContextValue = {
  registerClickHandler: (id: string, ref: ElementRef, handler: ClickHandler) => void;
  unregisterClickHandler: (id: string) => void;
  registerMouseEnterHandler: (id: string, ref: ElementRef, handler: MouseEnterHandler) => void;
  unregisterMouseEnterHandler: (id: string) => void;
  registerMouseLeaveHandler: (id: string, ref: ElementRef, handler: MouseLeaveHandler) => void;
  unregisterMouseLeaveHandler: (id: string) => void;
  registerWheelHandler: (id: string, ref: ElementRef, handler: WheelHandler) => void;
  unregisterWheelHandler: (id: string) => void;
};
