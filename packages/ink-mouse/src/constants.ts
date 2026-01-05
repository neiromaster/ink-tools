/**
 * Mouse event types from xterm-mouse
 */
export const MOUSE_EVENTS = {
  PRESS: 'press',
  RELEASE: 'release',
  CLICK: 'click',
  WHEEL: 'wheel',
  MOVE: 'move',
  DRAG: 'drag',
} as const;

/**
 * Default options for MouseProvider
 */
export const DEFAULT_PROVIDER_OPTIONS = {
  autoEnable: true,
} as const;

/**
 * Development mode warning prefix
 */
export const DEV_WARNING = '[ink-mouse]';

/**
 * Error messages
 */
export const ERRORS = {
  NO_PROVIDER:
    // biome-ignore lint/security/noSecrets: This is an error message, not a secret
    'Mouse hooks must be used within a MouseProvider. Wrap your component tree with <MouseProvider>.',
  NOT_SUPPORTED: 'Terminal does not support mouse events',
  NULL_REF: 'ref is null or undefined',
  NULL_HANDLER: 'handler is null or undefined',
} as const;
