import { mergeConfig } from 'vitest/config';
import baseConfig from '../../vitest.config.base';

/**
 * Vitest configuration for xterm-mouse package
 *
 * Extends the base monorepo configuration with package-specific settings.
 */
export default mergeConfig(baseConfig, {
  // Package-specific settings can be added here if needed
  // Currently uses all settings from base config
});
