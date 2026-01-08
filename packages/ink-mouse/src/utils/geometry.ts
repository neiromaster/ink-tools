import type { BoundingClientRect } from '../types';

/**
 * Check if a point (x, y) is inside a rectangle.
 *
 * @param x - The x coordinate of the point.
 * @param y - The y coordinate of the point.
 * @param rect - The bounding rectangle.
 * @returns True if the point is inside the rectangle, false otherwise.
 *
 * @example
 * ```ts
 * const rect = { left: 10, top: 10, right: 20, bottom: 20, width: 10, height: 10, x: 10, y: 10 };
 * isPointInRect(15, 15, rect); // true
 * isPointInRect(5, 5, rect);   // false
 * ```
 */
export function isPointInRect(x: number, y: number, rect: BoundingClientRect): boolean {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

/**
 * Get the center point of a rectangle.
 *
 * Useful for centering elements, calculating anchor points for connectors,
 * or positioning tooltips relative to elements.
 *
 * @param rect - The bounding rectangle.
 * @returns The center point {x, y}.
 *
 * @example
 * ```ts
 * const rect = { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10, x: 0, y: 0 };
 * getRectCenter(rect); // { x: 5, y: 5 }
 * ```
 *
 * @example
 * ```ts
 * // Position a tooltip at the center of a button
 * import { getBoundingClientRect, getRectCenter } from '@ink-tools/ink-mouse';
 *
 * const buttonRect = getBoundingClientRect(buttonRef.current);
 * if (buttonRect) {
 *   const center = getRectCenter(buttonRect);
 *   console.log(`Button center: ${center.x}, ${center.y}`);
 * }
 * ```
 */
export function getRectCenter(rect: BoundingClientRect): { x: number; y: number } {
  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2,
  };
}

/**
 * Check if two rectangles overlap.
 *
 * Useful for collision detection, determining if elements intersect,
 * or checking if a dragged element overlaps with drop targets.
 *
 * @param rect1 - The first rectangle.
 * @param rect2 - The second rectangle.
 * @returns True if the rectangles overlap, false otherwise.
 *
 * @example
 * ```ts
 * const rect1 = { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10, x: 0, y: 0 };
 * const rect2 = { left: 5, top: 5, right: 15, bottom: 15, width: 10, height: 10, x: 5, y: 5 };
 * isRectOverlapping(rect1, rect2); // true
 * ```
 *
 * @example
 * ```ts
 * // Check if a dragged element overlaps with drop zones
 * import { useBoundingClientRect, isRectOverlapping } from '@ink-tools/ink-mouse';
 *
 * function DragItem() {
 *   const dragRect = useBoundingClientRect(dragRef);
 *   const dropZoneRect = useBoundingClientRect(dropZoneRef);
 *
 *   const canDrop = dragRect && dropZoneRect && isRectOverlapping(dragRect, dropZoneRect);
 *
 *   return <Box>{canDrop ? 'Drop here!' : 'Drag over target'}</Box>;
 * }
 * ```
 */
export function isRectOverlapping(rect1: BoundingClientRect, rect2: BoundingClientRect): boolean {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}
