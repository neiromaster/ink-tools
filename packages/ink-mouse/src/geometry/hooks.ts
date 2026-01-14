import type { DOMElement } from 'ink';
import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import type { BoundingClientRect } from '../types';
import { getBoundingClientRect, getElementDimensions, getElementPosition } from './utils';

/**
 * Stateful hook to provide the position of the referenced element.
 *
 * @param ref - The reference to the element.
 * @param deps - Dependencies to recompute the position.
 * @returns The position of the element.
 */
export function useElementPosition(
  ref: RefObject<DOMElement | null>,
  deps: unknown[] = [],
): { left: number; top: number } {
  const [position, setPosition] = useState<{
    left: number;
    top: number;
  }>({
    top: 0,
    left: 0,
  });

  useEffect(
    function UpdatePosition() {
      const position = getElementPosition(ref.current);
      if (!position) {
        return;
      }
      setPosition(position);
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps is a parameter for flexibility
    deps,
  );

  return position;
}

export function useElementDimensions(
  ref: RefObject<DOMElement | null>,
  deps: unknown[] = [],
): { width: number; height: number } {
  const [dimensions, setDimensions] = useState<{
    width: number;
    height: number;
  }>({
    width: 0,
    height: 0,
  });

  useEffect(
    function UpdateDimensions() {
      const dimensions = getElementDimensions(ref.current);
      if (!dimensions) {
        return;
      }
      setDimensions(dimensions);
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps is a parameter for flexibility
    deps,
  );

  return dimensions;
}

/**
 * Hook to get the bounding client rect of a referenced element.
 *
 * @param ref - The reference to the element.
 * @param deps - Dependencies to recompute the bounding rect.
 * @returns The bounding client rect of the element.
 */
export function useBoundingClientRect(ref: RefObject<DOMElement | null>, deps: unknown[] = []): BoundingClientRect {
  const [rect, setRect] = useState<BoundingClientRect>({
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  });

  useEffect(
    function UpdateBoundingClientRect() {
      const rect = getBoundingClientRect(ref.current);
      if (!rect) {
        return;
      }
      setRect(rect);
    },
    // biome-ignore lint/correctness/useExhaustiveDependencies: deps is a parameter for flexibility
    deps,
  );

  return rect;
}
