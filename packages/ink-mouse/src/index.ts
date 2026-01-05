// Types

// Context (exported for advanced use cases)
export { MouseContext } from './context';
// Geometry functions
export {
  getBoundingClientRect,
  getElementDimensions,
  getElementPosition,
  useBoundingClientRect,
  useElementDimensions,
  useElementPosition,
} from './geometry';
// Hooks
export { useMouse, useOnClick, useOnMouseEnter, useOnMouseLeave, useOnWheel } from './hooks';
// Provider
export { MouseProvider } from './provider';
export type {
  BoundingClientRect,
  ClickHandler,
  DOMRect,
  ElementRef,
  InkMouseEvent,
  MouseContextValue,
  MouseEnterHandler,
  MouseLeaveHandler,
  WheelHandler,
} from './types';

// Utilities
export * from './utils';
