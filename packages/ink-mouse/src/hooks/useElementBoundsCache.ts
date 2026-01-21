import type { DOMElement } from 'ink';
import { useCallback, useRef } from 'react';
import { getBoundingClientRect } from '../geometry';
import type { BoundingClientRect } from '../types';

type CachedElementState = {
  isHovering: boolean;
  bounds?: BoundingClientRect;
  boundsTimestamp?: number;
};

/**
 * Hook to manage cached element bounds for mouse event detection
 *
 * Provides efficient bounds calculation with configurable cache invalidation.
 * Uses WeakMap for automatic garbage collection when refs are released.
 *
 * @param cacheInvalidationMs - Cache validity period in milliseconds (default: 100)
 * @returns getCachedState function to retrieve element bounds with caching
 *
 * @example
 * ```ts
 * const { getCachedState } = useElementBoundsCache(100);
 * const state = getCachedState(ref);
 * if (state.bounds && isPointInRect(x, y, state.bounds)) {
 *   // Handle event
 * }
 * ```
 */
export function useElementBoundsCache(cacheInvalidationMs: number = 100): {
  getCachedState: (ref: React.RefObject<unknown>) => CachedElementState;
  hoverStateRef: React.MutableRefObject<WeakMap<React.RefObject<unknown>, CachedElementState>>;
} {
  // Track hover state and cached bounds per element (ref)
  const hoverStateRef = useRef<WeakMap<React.RefObject<unknown>, CachedElementState>>(new WeakMap());

  const getCachedState = useCallback(
    (ref: React.RefObject<unknown>): CachedElementState => {
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
    },
    [cacheInvalidationMs],
  );

  return { getCachedState, hoverStateRef };
}
