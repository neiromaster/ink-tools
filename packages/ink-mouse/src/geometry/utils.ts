import type { DOMElement } from 'ink';
import type { BoundingClientRect } from '../types';

/**
 * Get the dimensions of the element.
 */
export function getElementDimensions(node: DOMElement | null): { width: number; height: number } | undefined {
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
export function getElementPosition(node: DOMElement | null): { left: number; top: number } | undefined {
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
 * Get the bounding client rect of an element.
 *
 * @param node - The DOMElement node.
 * @returns The bounding client rect or undefined if node is null.
 */
export function getBoundingClientRect(node: DOMElement | null): BoundingClientRect | undefined {
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
