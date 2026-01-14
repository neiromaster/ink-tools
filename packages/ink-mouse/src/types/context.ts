import type { RefObject } from 'react';
import type { MouseEventHandler, MouseEventType } from './events';

/**
 * Element ref type
 */
export type ElementRef = RefObject<unknown>;

/**
 * Mouse context value exposed by MouseProvider
 */
export type MouseContextValue = {
  isEnabled: boolean;
  enable: () => void;
  disable: () => void;
  isTracking: boolean;
};

/**
 * Registry context value for internal use by hooks
 */
export type MouseRegistryContextValue = {
  registerHandler: (id: string, ref: ElementRef, eventType: MouseEventType, handler: MouseEventHandler) => void;
  unregisterHandler: (id: string) => void;
};
