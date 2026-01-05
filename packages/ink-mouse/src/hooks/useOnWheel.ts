import type { ElementRef, WheelHandler } from '../types';
import { useMouseEventInternal } from './useMouseEventInternal';

/**
 * Hook for handling wheel (scroll) events on an element.
 * Must be used within a MouseProvider.
 *
 * @param ref - Reference to the element.
 * @param handler - Wheel event handler.
 *
 * @throws {Error} If used outside of MouseProvider
 *
 * @example
 * ```tsx
 * function Scrollable() {
 *   const ref = useRef<DOMElement>(null);
 *   const [offset, setOffset] = useState(0);
 *
 *   useOnWheel(ref, (event) => {
 *     if (event.button === 'wheel-up') {
 *       setOffset((prev) => Math.max(0, prev - 1));
 *     } else if (event.button === 'wheel-down') {
 *       setOffset((prev) => prev + 1);
 *     }
 *   });
 *
 *   return (
 *     <Box ref={ref} height={10}>
 *       <Box flexDirection="column" translateY={-offset}>
 *         {items.map((item) => (
 *           <Text key={item.id}>{item.name}</Text>
 *         ))}
 *       </Box>
 *     </Box>
 *   );
 * }
 * ```
 */
export function useOnWheel(ref: ElementRef, handler: WheelHandler | null | undefined): void {
  useMouseEventInternal(
    'wheel',
    ref,
    handler,
    (r, id, ref, h) => r.registerWheelHandler(id, ref, h),
    (r, id) => r.unregisterWheelHandler(id),
  );
}
