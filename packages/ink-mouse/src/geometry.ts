import type { DOMElement } from 'ink';
import type { RefObject } from 'react';
import { useEffect, useState } from 'react';
import type { BoundingClientRect } from './types';

/**
 * Stateful hook to provide the position of the referenced element.
 *
 * @param ref - The reference to the element.
 * @param deps - Dependencies to recompute the position.
 * @returns The position of the element.
 */
function useElementPosition(ref: RefObject<DOMElement | null>, deps: unknown[] = []): { left: number; top: number } {
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

function useElementDimensions(
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

function getElementDimensions(node: DOMElement | null): { width: number; height: number } | undefined {
  const elementLayout = node?.yogaNode?.getComputedLayout();

  if (!elementLayout) {
    return;
  }

  return {
    width: elementLayout.width,
    height: elementLayout.height,
  };
}

/**
 * Get the position of the element.
 */
function getElementPosition(node: DOMElement | null): { left: number; top: number } | undefined {
  if (!node) {
    return;
  }
  const { left, top } = walkNodePosition(node);

  return {
    left,
    top,
  };
}

/**
 * Walks the node's ancestry to calculate its absolute position.
 *
 * This function traverses up the parent chain of a DOMElement, accumulating
 * the `left` and `top` layout values to determine the element's final
 * absolute position within the Ink rendering context.
 *
 * Note: The initial `left` and `top` values are set to 1 because terminal
 * coordinates are 1-indexed. Relative coordinates of each element, however,
 * start from 0.
 *
 * Since InkNodes are relative by default and because Ink does not
 * provide precomputed x and y values, we need to walk the parent and
 * accumulate the x and y values.
 *
 * @param node - The DOMElement for which to calculate the position.
 * @returns An object containing the calculated `left` and `top` absolute coordinates.
 */
function walkNodePosition(node: DOMElement): { left: number; top: number } {
  let current: DOMElement | undefined = node;
  let left = 1;
  let top = 1;

  while (current) {
    if (!current.yogaNode) {
      return { left, top };
    }

    const layout = current.yogaNode.getComputedLayout();
    left += layout.left;
    top += layout.top;

    current = current.parentNode;
  }
  return { left, top };
}

/**
 * Hook to get the bounding client rect of a referenced element.
 *
 * @param ref - The reference to the element.
 * @param deps - Dependencies to recompute the bounding rect.
 * @returns The bounding client rect of the element.
 */
function useBoundingClientRect(ref: RefObject<DOMElement | null>, deps: unknown[] = []): BoundingClientRect {
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

/**
 * Get the bounding client rect of an element.
 *
 * @param node - The DOMElement node.
 * @returns The bounding client rect or undefined if node is null.
 */
function getBoundingClientRect(node: DOMElement | null): BoundingClientRect | undefined {
  if (!node) {
    return;
  }

  const position = getElementPosition(node);
  const dimensions = getElementDimensions(node);

  if (!position || !dimensions) {
    return;
  }

  const { left, top } = position;
  const { width, height } = dimensions;

  const right = left + width;
  const bottom = top + height;

  return {
    left,
    top,
    right,
    bottom,
    width,
    height,
    x: left,
    y: top,
  };
}

export {
  useElementPosition,
  getElementPosition,
  getElementDimensions,
  useElementDimensions,
  getBoundingClientRect,
  useBoundingClientRect,
};
