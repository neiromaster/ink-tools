import { Mouse } from '@ink-tools/xterm-mouse';
import { useContext } from 'react';
import { DEV_WARNING, ERRORS } from '../constants';
import { MouseContext } from '../context';

type UseMouseReturn = {
  isEnabled: boolean;
  isTracking: boolean;
  isSupported: boolean;
  enable: () => void;
  disable: () => void;
};

/**
 * Hook for accessing mouse control and state
 * Must be used within a MouseProvider
 *
 * @throws {Error} If used outside of MouseProvider
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const mouse = useMouse();
 *
 *   return (
 *     <Box>
 *       <Text>Mouse enabled: {mouse.isEnabled}</Text>
 *       <Text>Supported: {mouse.isSupported}</Text>
 *     </Box>
 *   );
 * }
 * ```
 */
export function useMouse(): UseMouseReturn {
  const context = useContext(MouseContext);

  if (!context) {
    throw new Error(`${DEV_WARNING} ${ERRORS.NO_PROVIDER}`);
  }

  const isSupported = Mouse.isSupported();

  return {
    ...context,
    isSupported,
  };
}
