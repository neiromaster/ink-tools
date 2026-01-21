import type { DOMElement } from 'ink';
import { useCallback, useRef } from 'react';
import { getBoundingClientRect } from '../geometry';
import type { BoundingClientRect } from '../types';

type CachedElementState = {
  bounds?: BoundingClientRect;
  boundsTimestamp?: number;
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
  // Track cached bounds per element (ref) - geometry only
  const boundsStateRef = useRef<WeakMap<React.RefObject<unknown>, CachedElementState>>(new WeakMap());

  // Track hover state per element (ref) - interaction state only
  const hoverStateRef = useRef<WeakMap<React.RefObject<unknown>, boolean>>(new WeakMap());

  const getCachedState = useCallback(
    (ref: React.RefObject<unknown>): CachedElementState => {
      const existing = boundsStateRef.current.get(ref);
      const now = Date.now();

      // Check if cache is valid
      if (existing?.bounds && existing.boundsTimestamp && now - existing.boundsTimestamp < cacheInvalidationMs) {
        return existing;
      }

      // Cache miss or expired - recalculate bounds
      const bounds = getBoundingClientRect(ref.current as DOMElement | null);
      const state: CachedElementState = {
        bounds,
        boundsTimestamp: now,
      };

      boundsStateRef.current.set(ref, state);
      return state;
    },
    [cacheInvalidationMs],
  );

  return { getCachedState, hoverStateRef };
}
