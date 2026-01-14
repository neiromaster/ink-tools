/**
 * Type definitions for ink-mouse
 *
 * This module exports all TypeScript types used throughout the package.
 */

export type { ElementRef, MouseContextValue, MouseRegistryContextValue } from './context';

export type {
  ClickHandler,
  InkMouseEvent,
  MouseDragHandler,
  MouseEnterHandler,
  MouseEventHandler,
  MouseEventType,
  MouseLeaveHandler,
  MouseMoveHandler,
  MousePressHandler,
  MouseReleaseHandler,
  WheelHandler,
} from './events';
export type { BoundingClientRect, DOMRect } from './geometry';

export type {
  ClickHandlerEntry,
  HandlerRegistry,
  MouseDragHandlerEntry,
  MouseEnterHandlerEntry,
  MouseLeaveHandlerEntry,
  MouseMoveHandlerEntry,
  MousePressHandlerEntry,
  MouseReleaseHandlerEntry,
  WheelHandlerEntry,
} from './registry';
