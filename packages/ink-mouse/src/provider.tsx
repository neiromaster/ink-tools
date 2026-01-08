import type { DOMElement } from 'ink';
import type { FC, PropsWithChildren } from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as XtermMouseEvent } from 'xterm-mouse';
import { Mouse } from 'xterm-mouse';
import { DEFAULT_PROVIDER_OPTIONS, DEV_WARNING, ERRORS, MOUSE_EVENTS } from './constants';
import { MouseContext, MouseRegistryContext } from './context';
import { getBoundingClientRect } from './geometry';
import type { BoundingClientRect, MouseContextValue, MouseRegistryContextValue } from './types';
import { isPointInRect } from './utils/geometry';

type MouseProviderProps = PropsWithChildren<{
  readonly autoEnable?: boolean;
  readonly cacheInvalidationMs?: number;
}>;

type CachedElementState = {
  isHovering: boolean;
  bounds?: BoundingClientRect;
  boundsTimestamp?: number;
};

export const MouseProvider: FC<MouseProviderProps> = ({
  children,
  autoEnable = DEFAULT_PROVIDER_OPTIONS.autoEnable,
  cacheInvalidationMs = DEFAULT_PROVIDER_OPTIONS.cacheInvalidationMs,
}: MouseProviderProps) => {
  const [isEnabled, setIsEnabled] = useState(false);
  const [isTracking, setIsTracking] = useState(false);

  const mouseRef = useRef<Mouse | null>(null);
  const handlersRef = useRef<
    Map<
      string,
      {
        type:
          | 'click'
          | 'mouseEnter'
          | 'mouseLeave'
          | 'mousePress'
          | 'mouseRelease'
          | 'mouseMove'
          | 'mouseDrag'
          | 'wheel';
        ref: React.RefObject<unknown>;
        handler: unknown;
      }
    >
  >(new Map());
  // Track hover state and cached bounds per element (ref)
  const hoverStateRef = useRef<WeakMap<React.RefObject<unknown>, CachedElementState>>(new WeakMap());

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
      handler: (event: XtermMouseEvent) => void,
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

    const getCachedState = (ref: React.RefObject<unknown>): CachedElementState => {
      const existing = hoverStateRef.current.get(ref);
      const now = Date.now();

      // Check if cache is valid
      if (existing?.bounds && existing.boundsTimestamp && now - existing.boundsTimestamp < cacheInvalidationMs) {
        return existing;
      }

      // Cache miss or expired - recalculate bounds
      const bounds = getBoundingClientRect(ref.current as DOMElement | null);
      const state: CachedElementState = {
        isHovering: existing?.isHovering ?? false,
        bounds,
        boundsTimestamp: now,
      };

      hoverStateRef.current.set(ref, state);
      return state;
    };

    const createGenericHandler =
      (eventType: 'click' | 'wheel' | 'mousePress' | 'mouseRelease' | 'mouseMove' | 'mouseDrag') =>
      (event: XtermMouseEvent): void => {
        const { x, y } = event;

        handlersRef.current.forEach((entry) => {
          if (entry.type !== eventType) return;

          const cached = getCachedState(entry.ref);
          if (!cached.bounds) return;

          if (isPointInRect(x, y, cached.bounds)) {
            (entry.handler as (event: XtermMouseEvent) => void)(event);
          }
        });
      };

    // Move event handler (for hover and mouse move)
    const handleMove = (event: XtermMouseEvent): void => {
      const { x, y } = event;

      // Handle all event types in a single pass
      handlersRef.current.forEach((entry) => {
        const cached = getCachedState(entry.ref);

        if (!cached.bounds) return;

        const isInside = isPointInRect(x, y, cached.bounds);

        switch (entry.type) {
          case 'mouseMove':
            if (isInside) {
              (entry.handler as (event: XtermMouseEvent) => void)(event);
            }
            break;

          case 'mouseEnter':
            if (isInside !== cached.isHovering) {
              cached.isHovering = isInside;
              hoverStateRef.current.set(entry.ref, cached);
              if (isInside) {
                (entry.handler as (event: XtermMouseEvent) => void)(event);
              }
            }
            break;

          case 'mouseLeave':
            if (isInside !== cached.isHovering) {
              cached.isHovering = isInside;
              hoverStateRef.current.set(entry.ref, cached);
              if (!isInside) {
                (entry.handler as (event: XtermMouseEvent) => void)(event);
              }
            }
            break;

          default:
            break;
        }
      });
    };

    // Create handlers from the generic factory
    const handleClick = createGenericHandler('click');
    const handleWheel = createGenericHandler('wheel');
    const handlePress = createGenericHandler('mousePress');
    const handleRelease = createGenericHandler('mouseRelease');
    const handleDrag = createGenericHandler('mouseDrag');

    // Register event listeners
    mouse.on(MOUSE_EVENTS.CLICK, handleClick);
    mouse.on(MOUSE_EVENTS.MOVE, handleMove);
    mouse.on(MOUSE_EVENTS.WHEEL, handleWheel);
    mouse.on(MOUSE_EVENTS.PRESS, handlePress);
    mouse.on(MOUSE_EVENTS.RELEASE, handleRelease);
    mouse.on(MOUSE_EVENTS.DRAG, handleDrag);

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
  }, [autoEnable, cacheInvalidationMs]);

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
