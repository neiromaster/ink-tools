import { describe, expect, test } from 'bun:test';
import type { InkMouseEvent } from '../types';
import { filterEvent, hasAnyModifier, hasModifier, transformEvent } from './events';

/**
 * Create a mock InkMouseEvent for testing
 */
function createMockInkMouseEvent(props: Partial<InkMouseEvent> = {}): InkMouseEvent {
  return {
    x: 1,
    y: 1,
    button: 'left',
    action: 'press',
    shift: false,
    alt: false,
    ctrl: false,
    raw: 0,
    data: '',
    protocol: 'ESC',
    ...props,
  };
}

describe('hasModifier', () => {
  test('returns true when shift modifier is pressed', () => {
    const event = createMockInkMouseEvent({ shift: true, alt: false, ctrl: false });

    expect(hasModifier(event, 'shift')).toBe(true);
  });

  test('returns false when shift modifier is not pressed', () => {
    const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

    expect(hasModifier(event, 'shift')).toBe(false);
  });

  test('returns true when alt modifier is pressed', () => {
    const event = createMockInkMouseEvent({ shift: false, alt: true, ctrl: false });

    expect(hasModifier(event, 'alt')).toBe(true);
  });

  test('returns false when alt modifier is not pressed', () => {
    const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

    expect(hasModifier(event, 'alt')).toBe(false);
  });

  test('returns true when ctrl modifier is pressed', () => {
    const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: true });

    expect(hasModifier(event, 'ctrl')).toBe(true);
  });

  test('returns false when ctrl modifier is not pressed', () => {
    const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

    expect(hasModifier(event, 'ctrl')).toBe(false);
  });

  test('returns true when multiple modifiers are pressed and checking for one', () => {
    const event = createMockInkMouseEvent({ shift: true, alt: true, ctrl: false });

    expect(hasModifier(event, 'shift')).toBe(true);
    expect(hasModifier(event, 'alt')).toBe(true);
    expect(hasModifier(event, 'ctrl')).toBe(false);
  });

  test('handles all modifiers pressed', () => {
    const event = createMockInkMouseEvent({ shift: true, alt: true, ctrl: true });

    expect(hasModifier(event, 'shift')).toBe(true);
    expect(hasModifier(event, 'alt')).toBe(true);
    expect(hasModifier(event, 'ctrl')).toBe(true);
  });
});

describe('hasAnyModifier', () => {
  test('returns true when shift is pressed', () => {
    const event = createMockInkMouseEvent({ shift: true, alt: false, ctrl: false });

    expect(hasAnyModifier(event)).toBe(true);
  });

  test('returns true when alt is pressed', () => {
    const event = createMockInkMouseEvent({ shift: false, alt: true, ctrl: false });

    expect(hasAnyModifier(event)).toBe(true);
  });

  test('returns true when ctrl is pressed', () => {
    const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: true });

    expect(hasAnyModifier(event)).toBe(true);
  });

  test('returns true when multiple modifiers are pressed', () => {
    const event = createMockInkMouseEvent({ shift: true, alt: true, ctrl: false });

    expect(hasAnyModifier(event)).toBe(true);
  });

  test('returns true when all modifiers are pressed', () => {
    const event = createMockInkMouseEvent({ shift: true, alt: true, ctrl: true });

    expect(hasAnyModifier(event)).toBe(true);
  });

  test('returns false when no modifiers are pressed', () => {
    const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

    expect(hasAnyModifier(event)).toBe(false);
  });
});

describe('transformEvent', () => {
  test('returns event unchanged', () => {
    const event = createMockInkMouseEvent({ x: 10, y: 20, button: 'left', action: 'click' });

    const transformed = transformEvent(event);

    expect(transformed).toBe(event);
  });

  test('preserves all event properties', () => {
    const event = createMockInkMouseEvent({
      x: 15,
      y: 25,
      button: 'right',
      action: 'press',
      shift: true,
      alt: false,
      ctrl: true,
    });

    const transformed = transformEvent(event);

    expect(transformed.x).toBe(15);
    expect(transformed.y).toBe(25);
    expect(transformed.button).toBe('right');
    expect(transformed.action).toBe('press');
    expect(transformed.shift).toBe(true);
    expect(transformed.alt).toBe(false);
    expect(transformed.ctrl).toBe(true);
  });

  test('handles events with all properties', () => {
    const event = createMockInkMouseEvent({
      x: 1,
      y: 1,
      button: 'middle',
      action: 'drag',
      shift: true,
      alt: true,
      ctrl: true,
      raw: 32,
      data: 'test data',
      protocol: 'SGR',
    });

    const transformed = transformEvent(event);

    expect(transformed).toEqual(event);
  });
});

describe('filterEvent', () => {
  describe('shift filtering', () => {
    test('returns true when shift matches (true)', () => {
      const event = createMockInkMouseEvent({ shift: true, alt: false, ctrl: false });

      expect(filterEvent(event, { shift: true })).toBe(true);
    });

    test('returns true when shift matches (false)', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

      expect(filterEvent(event, { shift: false })).toBe(true);
    });

    test('returns false when shift does not match', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

      expect(filterEvent(event, { shift: true })).toBe(false);
    });

    test('returns true when shift is not specified', () => {
      const event = createMockInkMouseEvent({ shift: true, alt: false, ctrl: false });

      expect(filterEvent(event, {})).toBe(true);
    });
  });

  describe('alt filtering', () => {
    test('returns true when alt matches (true)', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: true, ctrl: false });

      expect(filterEvent(event, { alt: true })).toBe(true);
    });

    test('returns true when alt matches (false)', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

      expect(filterEvent(event, { alt: false })).toBe(true);
    });

    test('returns false when alt does not match', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

      expect(filterEvent(event, { alt: true })).toBe(false);
    });

    test('returns true when alt is not specified', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: true, ctrl: false });

      expect(filterEvent(event, {})).toBe(true);
    });
  });

  describe('ctrl filtering', () => {
    test('returns true when ctrl matches (true)', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: true });

      expect(filterEvent(event, { ctrl: true })).toBe(true);
    });

    test('returns true when ctrl matches (false)', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

      expect(filterEvent(event, { ctrl: false })).toBe(true);
    });

    test('returns false when ctrl does not match', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

      expect(filterEvent(event, { ctrl: true })).toBe(false);
    });

    test('returns true when ctrl is not specified', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: true });

      expect(filterEvent(event, {})).toBe(true);
    });
  });

  describe('combined modifier filtering', () => {
    test('returns true when all modifiers match', () => {
      const event = createMockInkMouseEvent({ shift: true, alt: true, ctrl: false });

      expect(filterEvent(event, { shift: true, alt: true, ctrl: false })).toBe(true);
    });

    test('returns false when one modifier does not match', () => {
      const event = createMockInkMouseEvent({ shift: true, alt: false, ctrl: false });

      expect(filterEvent(event, { shift: true, alt: true, ctrl: false })).toBe(false);
    });

    test('returns true when checking multiple modifiers and all match', () => {
      const event = createMockInkMouseEvent({ shift: true, alt: true, ctrl: true });

      expect(filterEvent(event, { shift: true, alt: true, ctrl: true })).toBe(true);
    });

    test('returns false when any specified modifier does not match', () => {
      const event = createMockInkMouseEvent({ shift: true, alt: true, ctrl: false });

      expect(filterEvent(event, { shift: true, alt: true, ctrl: true })).toBe(false);
    });

    test('returns true when only some modifiers are specified and they match', () => {
      const event = createMockInkMouseEvent({ shift: true, alt: true, ctrl: true });

      expect(filterEvent(event, { shift: true, ctrl: true })).toBe(true);
    });

    test('returns true when checking for no modifiers', () => {
      const event = createMockInkMouseEvent({ shift: false, alt: false, ctrl: false });

      expect(filterEvent(event, { shift: false, alt: false, ctrl: false })).toBe(true);
    });

    test('returns false when event has modifiers but filter expects none', () => {
      const event = createMockInkMouseEvent({ shift: true, alt: false, ctrl: false });

      expect(filterEvent(event, { shift: false, alt: false, ctrl: false })).toBe(false);
    });

    test('returns true when no filter options are provided', () => {
      const event = createMockInkMouseEvent({ shift: true, alt: true, ctrl: true });

      expect(filterEvent(event, {})).toBe(true);
    });
  });
});
