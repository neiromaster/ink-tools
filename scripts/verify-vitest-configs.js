#!/usr/bin/env node
/**
 * Verify all packages have valid Vitest configurations
 *
 * This script checks:
 * 1. All packages have vitest.config.ts
 * 2. All configs extend the base configuration
 * 3. All configs use mergeConfig
 *
 * Exit codes:
 * 0: All configs valid
 * 1: One or more configs invalid
 */

import { readFileSync, readdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const rootDir = join(__dirname, '..');
const packagesDir = join(rootDir, 'packages');

const errors = [];
const warnings = [];

console.log('🔍 Verifying Vitest configurations...\n');

// Get all package directories
const packageDirs = existsSync(packagesDir)
  ? readdirSync(packagesDir, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => join(packagesDir, dirent.name))
  : [];

if (packageDirs.length === 0) {
  console.error('❌ No packages found in packages/ directory');
  process.exit(1);
}

console.log(`Found ${packageDirs.length} packages\n`);

// Check each package
for (const pkgDir of packageDirs) {
  const pkgName = pkgDir.split('/').pop();
  const packageJsonPath = join(pkgDir, 'package.json');
  const vitestConfigPath = join(pkgDir, 'vitest.config.ts');

  // Skip if no package.json (not a package)
  if (!existsSync(packageJsonPath)) {
    continue;
  }

  console.log(`Checking ${pkgName}...`);

  // Check 1: vitest.config.ts exists
  if (!existsSync(vitestConfigPath)) {
    errors.push(`${pkgName}: Missing vitest.config.ts`);
    console.log(`  ❌ Missing vitest.config.ts`);
    continue;
  }
  console.log(`  ✓ Has vitest.config.ts`);

  // Read and validate config content
  let configContent;
  try {
    configContent = readFileSync(vitestConfigPath, 'utf-8');
  } catch (err) {
    errors.push(`${pkgName}: Cannot read vitest.config.ts: ${err.message}`);
    console.log(`  ❌ Cannot read vitest.config.ts`);
    continue;
  }

  // Check 2: Extends base config
  const extendsBase =
    configContent.includes("from '../../vitest.config.base'") ||
    configContent.includes('from "../../vitest.config.base"');

  if (!extendsBase) {
    errors.push(`${pkgName}: vitest.config.ts doesn't extend base config`);
    console.log(`  ❌ Doesn't extend base config`);
  } else {
    console.log(`  ✓ Extends base config`);
  }

  // Check 3: Uses mergeConfig
  if (!configContent.includes('mergeConfig')) {
    warnings.push(
      `${pkgName}: vitest.config.ts should use mergeConfig from vitest/config`,
    );
    console.log(`  ⚠  Should use mergeConfig`);
  } else {
    console.log(`  ✓ Uses mergeConfig`);
  }

  console.log('');
}

// Summary
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

if (warnings.length > 0) {
  console.log('\n⚠️  Warnings:');
  warnings.forEach((warning) => console.log(`  - ${warning}`));
}

if (errors.length > 0) {
  console.log('\n❌ Errors:');
  errors.forEach((error) => console.log(`  - ${error}`));
  console.log('\n❌ Vitest config validation failed!\n');
  process.exit(1);
} else {
  console.log('\n✅ All vitest configs are valid!\n');
  process.exit(0);
}
