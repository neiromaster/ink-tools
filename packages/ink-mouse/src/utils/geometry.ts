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
 * Create a bounding client rect from coordinates and dimensions.
 *
 * @param x - The x coordinate.
 * @param y - The y coordinate.
 * @param width - The width.
 * @param height - The height.
 * @returns The bounding client rect.
 *
 * @example
 * ```ts
 * const rect = createBoundingClientRect(10, 10, 100, 50);
 * // { left: 10, top: 10, right: 110, bottom: 60, width: 100, height: 50, x: 10, y: 10 }
 * ```
 */
export function createBoundingClientRect(x: number, y: number, width: number, height: number): BoundingClientRect {
  const left = x;
  const top = y;
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

/**
 * Get the center point of a rectangle.
 *
 * @param rect - The bounding rectangle.
 * @returns The center point {x, y}.
 *
 * @example
 * ```ts
 * const rect = { left: 0, top: 0, right: 10, bottom: 10, width: 10, height: 10, x: 0, y: 0 };
 * getRectCenter(rect); // { x: 5, y: 5 }
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
 */
export function isRectOverlapping(rect1: BoundingClientRect, rect2: BoundingClientRect): boolean {
  return !(
    rect1.right < rect2.left ||
    rect1.left > rect2.right ||
    rect1.bottom < rect2.top ||
    rect1.top > rect2.bottom
  );
}
