import { createContext } from 'react';
import type { MouseContextValue, MouseRegistryContextValue } from './types';

/**
 * React context for mouse functionality
 * Provides access to mouse instance and control methods
 */
export const MouseContext: React.Context<MouseContextValue | null> = createContext<MouseContextValue | null>(null);

/**
 * Internal React context for handler registry
 * Used by hooks to register/unregister event handlers
 */
export const MouseRegistryContext: React.Context<MouseRegistryContextValue | null> =
  createContext<MouseRegistryContextValue | null>(null);
