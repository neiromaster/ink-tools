/**
 * Custom Streams Example
 *
 * This example demonstrates dependency injection in the Mouse class,
 * showing how to use custom streams and setRawMode functions.
 *
 * Run with: pnpm run dev:custom-streams
 */

import { Mouse, MouseError } from '../src';

console.log('=== Custom Streams Dependency Injection Example ===\n');

// Example 1: Explicitly specify streams (even though they're the defaults)
console.log('Example 1: Using explicitly specified streams');
console.log('----------------------------------------------');

const mouse1: Mouse = new Mouse({
  inputStream: process.stdin,
  outputStream: process.stdout,
});

try {
  mouse1.enable();
  console.log('✓ Mouse enabled with explicitly specified streams');
  console.log('  - inputStream: process.stdin');
  console.log('  - outputStream: process.stdout');
  mouse1.disable();
  console.log('✓ Mouse disabled\n');
} catch (error) {
  if (error instanceof MouseError) {
    console.error('✗ MouseError:', error.message);
  }
  process.exit(1);
}

// Example 2: Custom setRawMode function for testing/mocking
console.log('Example 2: Using custom setRawMode function');
console.log('---------------------------------------------');

let rawModeEnabled = false;
const customSetRawMode = (mode: boolean): void => {
  rawModeEnabled = mode;
  console.log(`[Custom setRawMode] Called with mode=${mode}`);
};

const mouse2: Mouse = new Mouse({
  setRawMode: customSetRawMode,
});

try {
  mouse2.enable();
  console.log(`✓ Raw mode state: ${rawModeEnabled}`);
  mouse2.disable();
  console.log(`✓ Raw mode state after disable: ${rawModeEnabled}\n`);
} catch (error) {
  if (error instanceof MouseError) {
    console.error('✗ MouseError:', error.message);
  }
  process.exit(1);
}

// Example 3: All defaults (most common usage)
console.log('Example 3: Using all defaults (recommended)');
console.log('--------------------------------------------');

const mouse3: Mouse = new Mouse();
console.log('✓ Mouse created with all defaults');
console.log('  - Same as new Mouse({})');
console.log('  - Uses process.stdin, process.stdout');
console.log('  - Uses default stream.setRawMode');

try {
  mouse3.enable();
  console.log('✓ Mouse enabled with defaults\n');
  mouse3.destroy();
} catch (error) {
  if (error instanceof MouseError) {
    console.error('✗ MouseError:', error.message);
  }
  process.exit(1);
}

// Example 4: Combining multiple options
console.log('Example 4: Combining multiple options');
console.log('--------------------------------------');

const mockSetRawModeCalls: boolean[] = [];
const trackedSetRawMode = (mode: boolean): void => {
  mockSetRawModeCalls.push(mode);
  console.log(`[Tracked setRawMode] mode=${mode}`);
};

const mouse4: Mouse = new Mouse({
  inputStream: process.stdin,
  outputStream: process.stdout,
  setRawMode: trackedSetRawMode,
  clickDistanceThreshold: 5,
});

console.log('✓ Mouse created with:');
console.log('  - Custom streams (stdin/stdout)');
console.log('  - Tracked setRawMode function');
console.log('  - Custom click threshold: 5');

try {
  mouse4.enable();
  console.log(`✓ setRawMode called ${mockSetRawModeCalls.length} time(s)`);
  console.log(`  Calls: ${mockSetRawModeCalls.join(', ')}`);
  mouse4.disable();
  console.log(`✓ Total setRawMode calls: ${mockSetRawModeCalls.length}`);
  console.log(`  All calls: ${mockSetRawModeCalls.join(', ')}\n`);
} catch (error) {
  if (error instanceof MouseError) {
    console.error('✗ MouseError:', error.message);
  }
  process.exit(1);
}

console.log('=== Summary ===');
console.log('Dependency injection enables:');
console.log('  ✓ Custom streams for testing or non-standard environments');
console.log('  ✓ Mocked setRawMode for unit testing');
console.log('  ✓ Flexible configuration without constructor overloading');
console.log('  ✓ Backward compatibility with existing code');
console.log('\nAll examples completed successfully!');
