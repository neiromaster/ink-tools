import type { ClickHandler, ElementRef } from '../types';
import { useMouseEventInternal } from './useMouseEventInternal';

/**
 * Hook for handling click events on an element.
 * Must be used within a MouseProvider.
 *
 * @param ref - Reference to the element.
 * @param handler - Click event handler.
 *
 * @throws {Error} If used outside of MouseProvider
 *
 * @example
 * ```tsx
 * function Clickable() {
 *   const ref = useRef<DOMElement>(null);
 *
 *   useOnClick(ref, (event) => {
 *     console.log('Clicked at', event.x, event.y);
 *   });
 *
 *   return <Box ref={ref}>Click me</Box>;
 * }
 * ```
 */
export function useOnClick(ref: ElementRef, handler: ClickHandler | null | undefined): void {
  useMouseEventInternal(
    'click',
    ref,
    handler,
    (r, id, ref, h) => r.registerClickHandler(id, ref, h),
    (r, id) => r.unregisterClickHandler(id),
  );
}
