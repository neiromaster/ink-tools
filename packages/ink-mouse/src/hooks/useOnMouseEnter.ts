import type { ElementRef, InkMouseEvent } from '../types';
import { useMouseEventInternal } from './useMouseEventInternal';

/**
 * Hook for handling mouse enter events on an element.
 * Must be used within a MouseProvider.
 *
 * @param ref - Reference to the element.
 * @param handler - Mouse enter event handler.
 *
 * @throws {Error} If used outside of MouseProvider
 *
 * @example
 * ```tsx
 * function Component() {
 *   const ref = useRef<DOMElement>(null);
 *   const [message, setMessage] = useState('');
 *
 *   useOnMouseEnter(ref, () => setMessage('Mouse entered!'));
 *
 *   return (
 *     <Box ref={ref}>
 *       <Text>{message}</Text>
 *     </Box>
 *   );
 * }
 * ```
 */
export function useOnMouseEnter(ref: ElementRef, handler: ((event: InkMouseEvent) => void) | null | undefined): void {
  useMouseEventInternal(
    'mouseEnter',
    ref,
    handler,
    (r, id, ref, h) => r.registerMouseEnterHandler(id, ref, h),
    (r, id) => r.unregisterMouseEnterHandler(id),
  );
}
