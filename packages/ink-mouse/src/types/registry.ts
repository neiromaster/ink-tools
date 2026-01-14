import type { ElementRef } from './context';
import type {
  ClickHandler,
  MouseDragHandler,
  MouseEnterHandler,
  MouseLeaveHandler,
  MouseMoveHandler,
  MousePressHandler,
  MouseReleaseHandler,
  WheelHandler,
} from './events';

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
 * Handler entry for mouse press events in registry
 */
export type MousePressHandlerEntry = {
  id: string;
  ref: ElementRef;
  handler: MousePressHandler;
};

/**
 * Handler entry for mouse release events in registry
 */
export type MouseReleaseHandlerEntry = {
  id: string;
  ref: ElementRef;
  handler: MouseReleaseHandler;
};

/**
 * Handler entry for mouse move events in registry
 */
export type MouseMoveHandlerEntry = {
  id: string;
  ref: ElementRef;
  handler: MouseMoveHandler;
};

/**
 * Handler entry for mouse drag events in registry
 */
export type MouseDragHandlerEntry = {
  id: string;
  ref: ElementRef;
  handler: MouseDragHandler;
};

/**
 * Handler registry for all event types
 */
export type HandlerRegistry = {
  click: Map<string, ClickHandlerEntry>;
  mouseEnter: Map<string, MouseEnterHandlerEntry>;
  mouseLeave: Map<string, MouseLeaveHandlerEntry>;
  mousePress: Map<string, MousePressHandlerEntry>;
  mouseRelease: Map<string, MouseReleaseHandlerEntry>;
  mouseMove: Map<string, MouseMoveHandlerEntry>;
  mouseDrag: Map<string, MouseDragHandlerEntry>;
  wheel: Map<string, WheelHandlerEntry>;
};
