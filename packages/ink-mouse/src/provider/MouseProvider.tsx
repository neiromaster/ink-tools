import type { FC, PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_PROVIDER_OPTIONS, MOUSE_EVENTS } from '../constants';
import { MouseContext, MouseRegistryContext } from '../context';
import { createMouseEventHandlers } from '../hooks/createMouseEventHandlers';
import { useElementBoundsCache } from '../hooks/useElementBoundsCache';
import { useMouseInstance } from '../hooks/useMouseInstance';
import type { MouseContextValue, MouseRegistryContextValue } from '../types';

export type MouseProviderProps = PropsWithChildren<{
  readonly autoEnable?: boolean;
  readonly cacheInvalidationMs?: number;
}>;

type HandlerEntry = {
  type: 'click' | 'mouseEnter' | 'mouseLeave' | 'mousePress' | 'mouseRelease' | 'mouseMove' | 'mouseDrag' | 'wheel';
  ref: React.RefObject<unknown>;
  handler: unknown;
};

export const MouseProvider: FC<MouseProviderProps> = ({
  children,
  autoEnable = DEFAULT_PROVIDER_OPTIONS.autoEnable,
  cacheInvalidationMs = DEFAULT_PROVIDER_OPTIONS.cacheInvalidationMs,
}: MouseProviderProps) => {
  const [isEnabled, setIsEnabled] = useState(false);

  // Use extracted hooks for Mouse instance and cache management
  const { mouseRef, isTracking } = useMouseInstance(autoEnable);
  const { getCachedState, hoverStateRef } = useElementBoundsCache(cacheInvalidationMs);

  // Store registered event handlers
  const handlersRef = useRef<Map<string, HandlerEntry>>(new Map());

  // Unified handler registration
  const registerHandler = useCallback(
    (
      id: string,
      ref: React.RefObject<unknown>,
      eventType:
        | 'click'
        | 'mouseEnter'
        | 'mouseLeave'
        | 'mousePress'
        | 'mouseRelease'
        | 'mouseMove'
        | 'mouseDrag'
        | 'wheel',
      handler: unknown,
    ) => {
      handlersRef.current.set(id, { type: eventType, ref, handler });
    },
    [],
  );

  // Unified handler unregistration
  const unregisterHandler = useCallback((id: string) => {
    handlersRef.current.delete(id);
  }, []);

  // Registry context value
  const registryValue = useMemo<MouseRegistryContextValue>(
    () => ({
      registerHandler,
      unregisterHandler,
    }),
    [registerHandler, unregisterHandler],
  );

  // Setup event listeners using extracted handler creation logic
  useEffect((): (() => void) => {
    const mouse = mouseRef.current;
    if (!mouse) {
      return () => {
        // noop
      };
    }

    // Create event handlers using extracted function
    const { handleClick, handleMove, handleWheel, handlePress, handleRelease, handleDrag } = createMouseEventHandlers(
      getCachedState,
      hoverStateRef.current,
      handlersRef.current,
    );

    // Register event listeners
    mouse.on(MOUSE_EVENTS.CLICK, handleClick);
    mouse.on(MOUSE_EVENTS.MOVE, handleMove);
    mouse.on(MOUSE_EVENTS.WHEEL, handleWheel);
    mouse.on(MOUSE_EVENTS.PRESS, handlePress);
    mouse.on(MOUSE_EVENTS.RELEASE, handleRelease);
    mouse.on(MOUSE_EVENTS.DRAG, handleDrag);

    return () => {
      // Manually remove event listeners
      mouse.off(MOUSE_EVENTS.CLICK, handleClick);
      mouse.off(MOUSE_EVENTS.MOVE, handleMove);
      mouse.off(MOUSE_EVENTS.WHEEL, handleWheel);
      mouse.off(MOUSE_EVENTS.PRESS, handlePress);
      mouse.off(MOUSE_EVENTS.RELEASE, handleRelease);
      mouse.off(MOUSE_EVENTS.DRAG, handleDrag);
    };
  }, [getCachedState, hoverStateRef, mouseRef.current]);

  // Enable method
  const enable = useCallback((): void => {
    if (mouseRef.current && !isEnabled) {
      mouseRef.current.enable();
      setIsEnabled(true);
    }
  }, [isEnabled, mouseRef.current]);

  // Disable method
  const disable = useCallback((): void => {
    if (mouseRef.current && isEnabled) {
      mouseRef.current.disable();
      setIsEnabled(false);
    }
  }, [isEnabled, mouseRef.current]);

  // Context value
  const contextValue = useMemo<MouseContextValue>(
    () => ({
      isEnabled,
      isTracking,
      enable,
      disable,
    }),
    [isEnabled, isTracking, enable, disable],
  );

  return (
    <MouseContext.Provider value={contextValue}>
      <MouseRegistryContext.Provider value={registryValue}>{children}</MouseRegistryContext.Provider>
    </MouseContext.Provider>
  );
};
