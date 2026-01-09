import { describe, expect, test } from 'vitest';
import type { BoundingClientRect } from '../types';
import { getRectCenter, isPointInRect, isRectOverlapping } from './geometry';

describe('isPointInRect', () => {
  test('returns true when point is inside rectangle boundaries', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isPointInRect(15, 15, rect)).toBe(true);
  });

  test('returns true when point is on left edge', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isPointInRect(10, 15, rect)).toBe(true);
  });

  test('returns true when point is on right edge', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isPointInRect(20, 15, rect)).toBe(true);
  });

  test('returns true when point is on top edge', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isPointInRect(15, 10, rect)).toBe(true);
  });

  test('returns true when point is on bottom edge', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isPointInRect(15, 20, rect)).toBe(true);
  });

  test('returns false when point is outside rectangle (left)', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isPointInRect(5, 15, rect)).toBe(false);
  });

  test('returns false when point is outside rectangle (right)', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isPointInRect(25, 15, rect)).toBe(false);
  });

  test('returns false when point is outside rectangle (above)', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isPointInRect(15, 5, rect)).toBe(false);
  });

  test('returns false when point is outside rectangle (below)', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isPointInRect(15, 25, rect)).toBe(false);
  });

  test('handles negative coordinates correctly', () => {
    const rect: BoundingClientRect = {
      left: -10,
      top: -10,
      right: 0,
      bottom: 0,
      width: 10,
      height: 10,
      x: -10,
      y: -10,
    };

    expect(isPointInRect(-5, -5, rect)).toBe(true);
    expect(isPointInRect(-15, -5, rect)).toBe(false);
  });

  test('handles zero-width rectangle', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 10,
      bottom: 20,
      width: 0,
      height: 10,
      x: 10,
      y: 10,
    };

    // Point on the line
    expect(isPointInRect(10, 15, rect)).toBe(true);
    // Point off the line
    expect(isPointInRect(11, 15, rect)).toBe(false);
  });

  test('handles zero-height rectangle', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 10,
      width: 10,
      height: 0,
      x: 10,
      y: 10,
    };

    // Point on the line
    expect(isPointInRect(15, 10, rect)).toBe(true);
    // Point off the line
    expect(isPointInRect(15, 11, rect)).toBe(false);
  });
});

describe('getRectCenter', () => {
  test('returns center of standard rectangle', () => {
    const rect: BoundingClientRect = {
      left: 0,
      top: 0,
      right: 10,
      bottom: 10,
      width: 10,
      height: 10,
      x: 0,
      y: 0,
    };

    expect(getRectCenter(rect)).toEqual({ x: 5, y: 5 });
  });

  test('returns center of rectangle with odd dimensions', () => {
    const rect: BoundingClientRect = {
      left: 0,
      top: 0,
      right: 11,
      bottom: 11,
      width: 11,
      height: 11,
      x: 0,
      y: 0,
    };

    expect(getRectCenter(rect)).toEqual({ x: 5.5, y: 5.5 });
  });

  test('returns center of rectangle at origin', () => {
    const rect: BoundingClientRect = {
      left: 0,
      top: 0,
      right: 20,
      bottom: 30,
      width: 20,
      height: 30,
      x: 0,
      y: 0,
    };

    expect(getRectCenter(rect)).toEqual({ x: 10, y: 15 });
  });

  test('returns center of rectangle with negative coordinates', () => {
    const rect: BoundingClientRect = {
      left: -20,
      top: -30,
      right: 0,
      bottom: 0,
      width: 20,
      height: 30,
      x: -20,
      y: -30,
    };

    expect(getRectCenter(rect)).toEqual({ x: -10, y: -15 });
  });

  test('returns center of rectangle offset from origin', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 20,
      right: 30,
      bottom: 50,
      width: 20,
      height: 30,
      x: 10,
      y: 20,
    };

    expect(getRectCenter(rect)).toEqual({ x: 20, y: 35 });
  });
});

describe('isRectOverlapping', () => {
  test('returns true when two rectangles overlap partially', () => {
    const rect1: BoundingClientRect = {
      left: 0,
      top: 0,
      right: 10,
      bottom: 10,
      width: 10,
      height: 10,
      x: 0,
      y: 0,
    };

    const rect2: BoundingClientRect = {
      left: 5,
      top: 5,
      right: 15,
      bottom: 15,
      width: 10,
      height: 10,
      x: 5,
      y: 5,
    };

    expect(isRectOverlapping(rect1, rect2)).toBe(true);
  });

  test('returns false when rectangles are separated horizontally', () => {
    const rect1: BoundingClientRect = {
      left: 0,
      top: 0,
      right: 10,
      bottom: 10,
      width: 10,
      height: 10,
      x: 0,
      y: 0,
    };

    const rect2: BoundingClientRect = {
      left: 15,
      top: 0,
      right: 25,
      bottom: 10,
      width: 10,
      height: 10,
      x: 15,
      y: 0,
    };

    expect(isRectOverlapping(rect1, rect2)).toBe(false);
  });

  test('returns false when rectangles are separated vertically', () => {
    const rect1: BoundingClientRect = {
      left: 0,
      top: 0,
      right: 10,
      bottom: 10,
      width: 10,
      height: 10,
      x: 0,
      y: 0,
    };

    const rect2: BoundingClientRect = {
      left: 0,
      top: 15,
      right: 10,
      bottom: 25,
      width: 10,
      height: 10,
      x: 0,
      y: 15,
    };

    expect(isRectOverlapping(rect1, rect2)).toBe(false);
  });

  test('returns true when rectangles are adjacent (edge touching)', () => {
    const rect1: BoundingClientRect = {
      left: 0,
      top: 0,
      right: 10,
      bottom: 10,
      width: 10,
      height: 10,
      x: 0,
      y: 0,
    };

    const rect2: BoundingClientRect = {
      left: 10,
      top: 0,
      right: 20,
      bottom: 10,
      width: 10,
      height: 10,
      x: 10,
      y: 0,
    };

    expect(isRectOverlapping(rect1, rect2)).toBe(true);
  });

  test('returns true when one rectangle is completely inside another', () => {
    const rect1: BoundingClientRect = {
      left: 0,
      top: 0,
      right: 20,
      bottom: 20,
      width: 20,
      height: 20,
      x: 0,
      y: 0,
    };

    const rect2: BoundingClientRect = {
      left: 5,
      top: 5,
      right: 15,
      bottom: 15,
      width: 10,
      height: 10,
      x: 5,
      y: 5,
    };

    expect(isRectOverlapping(rect1, rect2)).toBe(true);
  });

  test('returns true when rectangles are identical', () => {
    const rect: BoundingClientRect = {
      left: 10,
      top: 10,
      right: 20,
      bottom: 20,
      width: 10,
      height: 10,
      x: 10,
      y: 10,
    };

    expect(isRectOverlapping(rect, rect)).toBe(true);
  });

  test('handles negative coordinates correctly', () => {
    const rect1: BoundingClientRect = {
      left: -20,
      top: -20,
      right: -10,
      bottom: -10,
      width: 10,
      height: 10,
      x: -20,
      y: -20,
    };

    const rect2: BoundingClientRect = {
      left: -15,
      top: -15,
      right: -5,
      bottom: -5,
      width: 10,
      height: 10,
      x: -15,
      y: -15,
    };

    expect(isRectOverlapping(rect1, rect2)).toBe(true);
  });

  test('is commutative - order does not matter', () => {
    const rect1: BoundingClientRect = {
      left: 0,
      top: 0,
      right: 10,
      bottom: 10,
      width: 10,
      height: 10,
      x: 0,
      y: 0,
    };

    const rect2: BoundingClientRect = {
      left: 5,
      top: 5,
      right: 15,
      bottom: 15,
      width: 10,
      height: 10,
      x: 5,
      y: 5,
    };

    expect(isRectOverlapping(rect1, rect2)).toBe(isRectOverlapping(rect2, rect1));
  });
});
