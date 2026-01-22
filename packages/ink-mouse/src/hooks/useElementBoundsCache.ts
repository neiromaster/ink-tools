import type { DOMElement } from 'ink';
import { useStdout } from 'ink';
import { useCallback, useEffect, useReducer, useRef } from 'react';
import { getBoundingClientRect } from '../geometry';
import type { BoundingClientRect } from '../types';

type CachedElementState = {
  bounds?: BoundingClientRect;
  boundsTimestamp?: number;
  layoutVersion?: number;
};

/**
 * Hook to manage cached element bounds for mouse event detection
 *
 * Provides efficient bounds calculation with configurable cache invalidation.
 * Uses WeakMap for automatic garbage collection when refs are released.
 *
 * Hover state is tracked separately from bounds cache to prevent race conditions
 * and ensure clean separation of concerns between geometry tracking and interaction state.
 *
 * Layout version tracking ensures cache invalidates on component re-renders and
 * terminal resize, preventing stale bounds during dynamic UI updates.
 *
 * @param cacheInvalidationMs - Cache validity period in milliseconds (default: 100)
 * @returns Object with getCachedState function and separate hoverStateRef
 *
 * @example
 * ```ts
 * const { getCachedState, hoverStateRef } = useElementBoundsCache(100);
 * const state = getCachedState(ref);
 * if (state.bounds && isPointInRect(x, y, state.bounds)) {
 *   // Handle event
 * }
 * ```
 */
export function useElementBoundsCache(cacheInvalidationMs: number = 100): {
  getCachedState: (ref: React.RefObject<unknown>) => CachedElementState;
  hoverStateRef: React.RefObject<WeakMap<React.RefObject<unknown>, boolean>>;
} {
  // Track layout version - increments on each render
  const [layoutVersion] = useReducer((s: number) => s + 1, 0);

  // Track terminal size for resize detection
  const { stdout } = useStdout();

  // Track cached bounds per element (ref) - geometry only
  const boundsStateRef = useRef<WeakMap<React.RefObject<unknown>, CachedElementState>>(new WeakMap());

  // Track hover state per element (ref) - interaction state only
  const hoverStateRef = useRef<WeakMap<React.RefObject<unknown>, boolean>>(new WeakMap());

  // Clear cache on terminal resize
  // biome-ignore lint/correctness/useExhaustiveDependencies: stdout.columns and stdout.rows trigger cache clear on resize
  useEffect(() => {
    boundsStateRef.current = new WeakMap();
  }, [stdout.columns, stdout.rows]);

  const getCachedState = useCallback(
    (ref: React.RefObject<unknown>): CachedElementState => {
      const existing = boundsStateRef.current.get(ref);
      const now = Date.now();

      // Check if cache is valid (time AND layout version must match)
      if (
        existing?.bounds &&
        existing.boundsTimestamp &&
        existing.layoutVersion === layoutVersion &&
        now - existing.boundsTimestamp < cacheInvalidationMs
      ) {
        return existing;
      }

      // Cache miss or expired - recalculate bounds
      const bounds = getBoundingClientRect(ref.current as DOMElement | null);
      const state: CachedElementState = {
        bounds,
        boundsTimestamp: now,
        layoutVersion,
      };

      boundsStateRef.current.set(ref, state);
      return state;
    },
    [cacheInvalidationMs, layoutVersion],
  );

  return { getCachedState, hoverStateRef };
}
