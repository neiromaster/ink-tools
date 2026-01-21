import { useStdin, useStdout } from 'ink';
import { useEffect, useRef, useState } from 'react';
import { Mouse } from 'xterm-mouse';
import { DEV_WARNING, ERRORS } from '../constants';

/**
 * Hook to manage Mouse instance lifecycle
 *
 * Handles creating, enabling, and cleaning up the Mouse instance.
 * Extracted from MouseProvider for better testability.
 *
 * Uses Ink's `useStdin` and `useStdout` hooks to access the streams managed
 * by Ink, ensuring proper integration with the Ink application lifecycle.
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

  // Get Ink-managed streams and raw mode control
  const { stdin, setRawMode } = useStdin();
  const { stdout } = useStdout();

  useEffect(() => {
    // Check if terminal supports mouse events using the actual streams that will be used
    if (!Mouse.isSupported(stdin, stdout)) {
      console.warn(`${DEV_WARNING} ${ERRORS.NOT_SUPPORTED}`);
      return (): void => {
        // noop
      };
    }

    // Create Mouse instance with Ink-managed streams
    mouseRef.current = new Mouse({
      inputStream: stdin,
      outputStream: stdout,
      setRawMode,
    });

    // Auto-enable if requested
    if (autoEnable) {
      mouseRef.current.enable();
    }

    // Set tracking state
    setIsTracking(true);

    // Cleanup function
    return (): void => {
      if (mouseRef.current) {
        mouseRef.current.destroy();
        mouseRef.current = null;
      }
      setIsTracking(false);
    };
  }, [autoEnable, stdin, stdout, setRawMode]);

  return { mouseRef, isTracking };
}
