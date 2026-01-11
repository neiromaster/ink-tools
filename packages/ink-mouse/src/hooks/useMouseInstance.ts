import { useEffect, useRef, useState } from 'react';
import { Mouse } from 'xterm-mouse';
import { DEV_WARNING, ERRORS } from '../constants';

/**
 * Hook to manage Mouse instance lifecycle
 *
 * Handles creating, enabling, and cleaning up the Mouse instance.
 * Extracted from MouseProvider for better testability.
 *
 * @param autoEnable - Whether to automatically enable mouse tracking
 * @returns Object with mouseRef and isTracking state
 *
 * @example
 * ```ts
 * const { mouseRef, isTracking } = useMouseInstance(true);
 * ```
 */
export function useMouseInstance(autoEnable: boolean): {
  mouseRef: React.MutableRefObject<Mouse | null>;
  isTracking: boolean;
} {
  const mouseRef = useRef<Mouse | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    // Check if terminal supports mouse events
    if (!Mouse.isSupported()) {
      console.warn(`${DEV_WARNING} ${ERRORS.NOT_SUPPORTED}`);
      return (): void => {
        // noop
      };
    }

    // Create Mouse instance
    const mouse = new Mouse();
    mouseRef.current = mouse;

    // Auto-enable if requested
    if (autoEnable) {
      mouse.enable();
    }

    // Set tracking state
    setIsTracking(true);

    // Cleanup function
    return (): void => {
      if (mouseRef.current) {
        mouseRef.current.disable();
        mouseRef.current = null;
      }
      setIsTracking(false);
    };
  }, [autoEnable]);

  return { mouseRef, isTracking };
}
