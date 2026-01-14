import { createContext } from 'react';
import type { MouseRegistryContextValue } from '../types';

/**
 * Internal React context for handler registry
 * Used by hooks to register/unregister event handlers
 */
export const MouseRegistryContext: React.Context<MouseRegistryContextValue | null> =
  createContext<MouseRegistryContextValue | null>(null);
