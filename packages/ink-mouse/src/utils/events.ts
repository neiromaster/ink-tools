import type { InkMouseEvent } from '../types';

/**
 * Check if an event has a specific modifier key pressed.
 *
 * @param event - The mouse event.
 * @param modifier - The modifier to check ('shift' | 'alt' | 'ctrl').
 * @returns True if the modifier is pressed, false otherwise.
 *
 * @example
 * ```ts
 * const event = { shift: true, alt: false, ctrl: true, ... };
 * hasModifier(event, 'shift'); // true
 * hasModifier(event, 'alt');   // false
 * ```
 */
export function hasModifier(event: InkMouseEvent, modifier: 'shift' | 'alt' | 'ctrl'): boolean {
  return event[modifier];
}

/**
 * Check if any modifier key is pressed.
 *
 * @param event - The mouse event.
 * @returns True if any modifier is pressed, false otherwise.
 *
 * @example
 * ```ts
 * const event = { shift: true, alt: false, ctrl: false, ... };
 * hasAnyModifier(event); // true
 * ```
 */
export function hasAnyModifier(event: InkMouseEvent): boolean {
  return event.shift || event.alt || event.ctrl;
}

/**
 * Transform an xterm-mouse event to InkMouseEvent.
 * Currently returns the event as-is since InkMouseEvent extends it.
 * This function exists for future extensibility.
 *
 * @param event - The xterm-mouse event.
 * @returns The transformed InkMouseEvent.
 */
export function transformEvent(event: InkMouseEvent): InkMouseEvent {
  // Currently no transformation needed
  // This function exists for future extensibility
  return event;
}

/**
 * Filter events based on modifier requirements.
 *
 * @param event - The mouse event.
 * @param options - Filter options.
 * @returns True if the event matches the filter, false otherwise.
 *
 * @example
 * ```ts
 * const event = { shift: true, alt: false, ctrl: false, ... };
 *
 * // Event must have shift pressed
 * filterEvent(event, { shift: true }); // true
 *
 * // Event must have only shift pressed (no alt or ctrl)
 * filterEvent(event, { shift: true, alt: false, ctrl: false }); // true
 *
 * // Event must have no modifiers
 * filterEvent(event, { shift: false, alt: false, ctrl: false }); // false
 * ```
 */
export function filterEvent(
  event: InkMouseEvent,
  options: {
    shift?: boolean;
    alt?: boolean;
    ctrl?: boolean;
  },
): boolean {
  if (options.shift !== undefined && event.shift !== options.shift) {
    return false;
  }
  if (options.alt !== undefined && event.alt !== options.alt) {
    return false;
  }
  if (options.ctrl !== undefined && event.ctrl !== options.ctrl) {
    return false;
  }
  return true;
}
