import type { DOMElement } from 'ink';
import { describe, expect, test } from 'vitest';
import { createMockDOMElement, createMockDOMElementChain } from '../../test/mocks/ink-element';
import { getBoundingClientRect, getElementDimensions, getElementPosition } from './utils';

describe('getElementPosition', () => {
  test('returns position for valid element with yogaNode', () => {
    const element = createMockDOMElement({
      left: 10,
      top: 20,
      width: 100,
      height: 50,
    });

    const position = getElementPosition(element);

    expect(position).toEqual({ left: 11, top: 21 }); // +1 for terminal 1-indexing
  });

  test('returns undefined for null element', () => {
    const position = getElementPosition(null);

    expect(position).toBeUndefined();
  });

  test('returns position with terminal 1-indexing for element without yogaNode', () => {
    const element = {} as DOMElement;

    const position = getElementPosition(element);

    // walkNodePosition returns { left: 1, top: 1 } for terminal 1-indexing
    // even without yogaNode
    expect(position).toEqual({ left: 1, top: 1 });
  });

  test('accumulates positions through parent chain', () => {
    const element = createMockDOMElementChain([
      { left: 5, top: 10, width: 50, height: 30 }, // child
      { left: 15, top: 20, width: 100, height: 50 }, // parent
      { left: 25, top: 30, width: 150, height: 70 }, // grandparent
    ]);

    const position = getElementPosition(element);

    // 1 (terminal) + 5 + 15 + 25 = 46 (left)
    // 1 (terminal) + 10 + 20 + 30 = 61 (top)
    expect(position).toEqual({ left: 46, top: 61 });
  });

  test('handles single element without parent', () => {
    const element = createMockDOMElement({
      left: 10,
      top: 20,
      width: 100,
      height: 50,
      parentNode: undefined,
    });

    const position = getElementPosition(element);

    expect(position).toEqual({ left: 11, top: 21 });
  });

  test('handles element at origin', () => {
    const element = createMockDOMElement({
      left: 0,
      top: 0,
      width: 100,
      height: 50,
    });

    const position = getElementPosition(element);

    expect(position).toEqual({ left: 1, top: 1 });
  });

  test('handles negative coordinates', () => {
    const element = createMockDOMElement({
      left: -10,
      top: -20,
      width: 100,
      height: 50,
    });

    const position = getElementPosition(element);

    expect(position).toEqual({ left: -9, top: -19 });
  });
});

describe('getElementDimensions', () => {
  test('returns dimensions for valid element with yogaNode', () => {
    const element = createMockDOMElement({
      left: 0,
      top: 0,
      width: 100,
      height: 50,
    });

    const dimensions = getElementDimensions(element);

    expect(dimensions).toEqual({ width: 100, height: 50 });
  });

  test('returns undefined for null element', () => {
    const dimensions = getElementDimensions(null);

    expect(dimensions).toBeUndefined();
  });

  test('returns undefined for element without yogaNode', () => {
    const element = {} as DOMElement;

    const dimensions = getElementDimensions(element);

    expect(dimensions).toBeUndefined();
  });

  test('extracts width and height correctly from yogaNode', () => {
    const element = createMockDOMElement({
      left: 10,
      top: 20,
      width: 123.45,
      height: 67.89,
    });

    const dimensions = getElementDimensions(element);

    expect(dimensions).toEqual({ width: 123.45, height: 67.89 });
  });

  test('handles zero dimensions', () => {
    const element = createMockDOMElement({
      left: 0,
      top: 0,
      width: 0,
      height: 0,
    });

    const dimensions = getElementDimensions(element);

    expect(dimensions).toEqual({ width: 0, height: 0 });
  });

  test('handles very large dimensions', () => {
    const element = createMockDOMElement({
      left: 0,
      top: 0,
      width: 10000,
      height: 10000,
    });

    const dimensions = getElementDimensions(element);

    expect(dimensions).toEqual({ width: 10000, height: 10000 });
  });
});

describe('getBoundingClientRect', () => {
  test('returns complete rect for valid element', () => {
    const element = createMockDOMElement({
      left: 10,
      top: 20,
      width: 100,
      height: 50,
    });

    const rect = getBoundingClientRect(element);

    expect(rect).toEqual({
      left: 11, // terminal 1-indexing
      top: 21,
      right: 111, // left + width
      bottom: 71, // top + height
      width: 100,
      height: 50,
      x: 11,
      y: 21,
    });
  });

  test('returns undefined for null element', () => {
    const rect = getBoundingClientRect(null);

    expect(rect).toBeUndefined();
  });

  test('returns undefined for element without yogaNode', () => {
    const element = {} as DOMElement;

    const rect = getBoundingClientRect(element);

    expect(rect).toBeUndefined();
  });

  test('calculates right and bottom correctly', () => {
    const element = createMockDOMElement({
      left: 10,
      top: 20,
      width: 100,
      height: 50,
    });

    const rect = getBoundingClientRect(element);

    expect(rect?.right).toBe(111); // left (11) + width (100)
    expect(rect?.bottom).toBe(71); // top (21) + height (50)
  });

  test('includes all required properties', () => {
    const element = createMockDOMElement({
      left: 5,
      top: 10,
      width: 30,
      height: 40,
    });

    const rect = getBoundingClientRect(element);

    expect(rect).toHaveProperty('left');
    expect(rect).toHaveProperty('top');
    expect(rect).toHaveProperty('right');
    expect(rect).toHaveProperty('bottom');
    expect(rect).toHaveProperty('width');
    expect(rect).toHaveProperty('height');
    expect(rect).toHaveProperty('x');
    expect(rect).toHaveProperty('y');
  });

  test('handles element at origin', () => {
    const element = createMockDOMElement({
      left: 0,
      top: 0,
      width: 10,
      height: 20,
    });

    const rect = getBoundingClientRect(element);

    expect(rect).toEqual({
      left: 1,
      top: 1,
      right: 11, // 1 + 10
      bottom: 21, // 1 + 20
      width: 10,
      height: 20,
      x: 1,
      y: 1,
    });
  });

  test('handles element with parent chain', () => {
    const element = createMockDOMElementChain([
      { left: 5, top: 10, width: 50, height: 30 }, // child
      { left: 15, top: 20, width: 100, height: 50 }, // parent
    ]);

    const rect = getBoundingClientRect(element);

    expect(rect).toEqual({
      left: 21, // 1 + 5 + 15
      top: 31, // 1 + 10 + 20
      right: 71, // 21 + 50
      bottom: 61, // 31 + 30
      width: 50,
      height: 30,
      x: 21,
      y: 31,
    });
  });

  test('handles negative coordinates', () => {
    const element = createMockDOMElement({
      left: -10,
      top: -20,
      width: 100,
      height: 50,
    });

    const rect = getBoundingClientRect(element);

    expect(rect).toEqual({
      left: -9,
      top: -19,
      right: 91, // left (-9) + width (100)
      bottom: 31, // top (-19) + height (50)
      width: 100,
      height: 50,
      x: -9,
      y: -19,
    });
  });

  test('x and y match left and top', () => {
    const element = createMockDOMElement({
      left: 10,
      top: 20,
      width: 100,
      height: 50,
    });

    const rect = getBoundingClientRect(element);

    expect(rect?.x).toBe(rect?.left);
    expect(rect?.y).toBe(rect?.top);
  });
});
