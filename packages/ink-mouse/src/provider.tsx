import type { MouseEvent as XtermMouseEvent } from '@neiropacks/xterm-mouse';
import { Mouse } from '@neiropacks/xterm-mouse';
import type { DOMElement } from 'ink';
import type { FC, PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { DEFAULT_PROVIDER_OPTIONS, DEV_WARNING, ERRORS, MOUSE_EVENTS } from './constants';
import { MouseContext, MouseRegistryContext } from './context';
import { getBoundingClientRect } from './geometry';
import type { MouseContextValue, MouseRegistryContextValue } from './types';
import { isPointInRect } from './utils/geometry';

type MouseProviderProps = PropsWithChildren<{
  readonly autoEnable?: boolean;
}>;

export const MouseProvider: FC<MouseProviderProps> = ({
  children,
  autoEnable = DEFAULT_PROVIDER_OPTIONS.autoEnable,
}: MouseProviderProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const mouseRef = useRef<Mouse | null>(null);
  const handlersRef = useRef<
    Map<
      string,
      { type: 'click' | 'mouseEnter' | 'mouseLeave' | 'wheel'; ref: React.RefObject<unknown>; handler: unknown }
    >
  >(new Map());
  // Track hover state per element (ref) to determine enter/leave events
  const hoverStateRef = useRef<WeakMap<React.RefObject<unknown>, boolean>>(new WeakMap());

  // Register click handler
  const registerClickHandler = useCallback<
    (id: string, ref: React.RefObject<unknown>, handler: (event: XtermMouseEvent) => void) => void
  >((id, ref, handler) => {
    handlersRef.current.set(id, { type: 'click', ref, handler });
  }, []);

  // Unregister click handler
  const unregisterClickHandler = useCallback((id: string) => {
    handlersRef.current.delete(id);
  }, []);

  // Register mouse enter handler
  const registerMouseEnterHandler = useCallback<
    (id: string, ref: React.RefObject<unknown>, handler: (event: XtermMouseEvent) => void) => void
  >((id, ref, handler) => {
    handlersRef.current.set(id, { type: 'mouseEnter', ref, handler });
  }, []);

  // Unregister mouse enter handler
  const unregisterMouseEnterHandler = useCallback((id: string) => {
    handlersRef.current.delete(id);
  }, []);

  // Register mouse leave handler
  const registerMouseLeaveHandler = useCallback<
    (id: string, ref: React.RefObject<unknown>, handler: (event: XtermMouseEvent) => void) => void
  >((id, ref, handler) => {
    handlersRef.current.set(id, { type: 'mouseLeave', ref, handler });
  }, []);

  // Unregister mouse leave handler
  const unregisterMouseLeaveHandler = useCallback((id: string) => {
    handlersRef.current.delete(id);
  }, []);

  // Register wheel handler
  const registerWheelHandler = useCallback<
    (id: string, ref: React.RefObject<unknown>, handler: (event: XtermMouseEvent) => void) => void
  >((id, ref, handler) => {
    handlersRef.current.set(id, { type: 'wheel', ref, handler });
  }, []);

  // Unregister wheel handler
  const unregisterWheelHandler = useCallback((id: string) => {
    handlersRef.current.delete(id);
  }, []);

  // Registry context value
  const registryValue = useMemo<MouseRegistryContextValue>(
    () => ({
      registerClickHandler,
      unregisterClickHandler,
      registerMouseEnterHandler,
      unregisterMouseEnterHandler,
      registerMouseLeaveHandler,
      unregisterMouseLeaveHandler,
      registerWheelHandler,
      unregisterWheelHandler,
    }),
    [
      registerClickHandler,
      unregisterClickHandler,
      registerMouseEnterHandler,
      unregisterMouseEnterHandler,
      registerMouseLeaveHandler,
      unregisterMouseLeaveHandler,
      registerWheelHandler,
      unregisterWheelHandler,
    ],
  );

  // Initialize mouse instance and setup event listeners
  useEffect((): (() => void) => {
    if (!Mouse.isSupported()) {
      console.warn(`${DEV_WARNING} ${ERRORS.NOT_SUPPORTED}`);
      return () => {
        // noop
      };
    }

    const mouse = new Mouse();
    mouseRef.current = mouse;

    if (autoEnable) {
      mouse.enable();
      setIsEnabled(true);
    }

    // Click event handler
    const handleClick = (event: XtermMouseEvent): void => {
      const { x, y } = event;

      handlersRef.current.forEach((entry) => {
        if (entry.type !== 'click') return;

        const bounds = getBoundingClientRect(entry.ref.current as DOMElement | null);
        if (!bounds) return;

        if (isPointInRect(x, y, bounds)) {
          (entry.handler as (event: XtermMouseEvent) => void)(event);
        }
      });
    };

    // Move event handler (for hover)
    const handleMove = (event: XtermMouseEvent): void => {
      const { x, y } = event;

      // Group handlers by ref
      const refsToHandlers = new Map<
        React.RefObject<unknown>,
        { onEnter: Array<(event: XtermMouseEvent) => void>; onLeave: Array<(event: XtermMouseEvent) => void> }
      >();

      handlersRef.current.forEach((entry) => {
        if (entry.type === 'mouseEnter' || entry.type === 'mouseLeave') {
          if (!refsToHandlers.has(entry.ref)) {
            refsToHandlers.set(entry.ref, { onEnter: [], onLeave: [] });
          }
          const handlers = refsToHandlers.get(entry.ref);
          if (!handlers) {
            return;
          }
          if (entry.type === 'mouseEnter') {
            handlers.onEnter.push(entry.handler as (event: XtermMouseEvent) => void);
          } else {
            handlers.onLeave.push(entry.handler as (event: XtermMouseEvent) => void);
          }
        }
      });

      // Check state changes and trigger handlers
      refsToHandlers.forEach((handlers, ref) => {
        const bounds = getBoundingClientRect(ref.current as DOMElement | null);
        if (!bounds) return;

        const isInside = isPointInRect(x, y, bounds);
        const wasInside = hoverStateRef.current.get(ref) ?? false;

        if (isInside !== wasInside) {
          hoverStateRef.current.set(ref, isInside);

          if (isInside) {
            // State changed: outside -> inside, trigger all enter handlers
            handlers.onEnter.forEach((handler) => {
              void handler(event);
            });
          } else {
            // State changed: inside -> outside, trigger all leave handlers
            handlers.onLeave.forEach((handler) => {
              void handler(event);
            });
          }
        }
      });
    };

    // Wheel event handler
    const handleWheel = (event: XtermMouseEvent): void => {
      const { x, y } = event;

      handlersRef.current.forEach((entry) => {
        if (entry.type !== 'wheel') return;

        const bounds = getBoundingClientRect(entry.ref.current as DOMElement | null);
        if (!bounds) return;

        if (isPointInRect(x, y, bounds)) {
          (entry.handler as (event: XtermMouseEvent) => void)(event);
        }
      });
    };

    // Register event listeners
    mouse.on(MOUSE_EVENTS.CLICK, handleClick);
    mouse.on(MOUSE_EVENTS.MOVE, handleMove);
    mouse.on(MOUSE_EVENTS.WHEEL, handleWheel);

    // Set tracking state
    setIsTracking(true);

    return () => {
      if (mouseRef.current) {
        mouseRef.current.disable();
        mouseRef.current = null;
      }
      setIsEnabled(false);
      setIsTracking(false);
    };
  }, [autoEnable]);

  // Enable method
  const enable = useCallback((): void => {
    if (mouseRef.current && !isEnabled) {
      mouseRef.current.enable();
      setIsEnabled(true);
    }
  }, [isEnabled]);

  // Disable method
  const disable = useCallback((): void => {
    if (mouseRef.current && isEnabled) {
      mouseRef.current.disable();
      setIsEnabled(false);
    }
  }, [isEnabled]);

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
