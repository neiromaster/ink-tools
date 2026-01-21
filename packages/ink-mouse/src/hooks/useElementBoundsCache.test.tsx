/**
 * Unit tests for useElementBoundsCache Hook
 *
 * Tests element bounds caching logic including cache invalidation,
 * bounds recalculation, and state preservation.
 */

import { Box, Text } from 'ink';
import { render } from 'ink-testing-library';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { createMockDOMElement } from '../../test/mocks/ink-element';
import { useElementBoundsCache } from './useElementBoundsCache';

// Test component that uses the hook
function TestCacheComponent({
  cacheInvalidationMs = 100,
  onCacheReady,
}: {
  cacheInvalidationMs?: number;
  onCacheReady?: (cache: ReturnType<typeof useElementBoundsCache>) => void;
}) {
  const cache = useElementBoundsCache(cacheInvalidationMs);

  // Notify parent that cache is ready
  if (onCacheReady) {
    onCacheReady(cache);
  }

  return (
    <Box>
      <Text>Cache Component</Text>
    </Box>
  );
}

describe('useElementBoundsCache', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  test('creates cache with default invalidation period', () => {
    // Arrange & Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    // Assert
    expect(capturedCache).toBeDefined();
    expect(capturedCache!.getCachedState).toBeDefined();
    expect(capturedCache!.hoverStateRef).toBeDefined();
  });

  test('creates cache with custom invalidation period', () => {
    // Arrange & Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        cacheInvalidationMs={200}
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    // Assert
    expect(capturedCache).toBeDefined();
    expect(capturedCache!.getCachedState).toBeDefined();
    expect(capturedCache!.hoverStateRef).toBeDefined();
  });

  test('returns cached state on first call', () => {
    // Arrange
    const mockElement = createMockDOMElement({ left: 10, top: 10, width: 50, height: 50 });
    const ref = { current: mockElement };

    // Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    // Assert cache was created
    expect(capturedCache).toBeDefined();
    const state = capturedCache!.getCachedState(ref);

    // Assert - hover state is separate from bounds cache
    expect(state).toBeDefined();
    expect(capturedCache!.hoverStateRef.current.get(ref)).toBeUndefined(); // No hover state yet
    expect(state.bounds).toBeDefined();
    expect(state.boundsTimestamp).toBeDefined();
  });

  test('reuses cached bounds within invalidation period', () => {
    // Arrange
    const mockElement = createMockDOMElement({ left: 10, top: 10, width: 50, height: 50 });
    const ref = { current: mockElement };

    // Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        cacheInvalidationMs={1000}
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    expect(capturedCache).toBeDefined();
    // First call - should calculate bounds
    const state1 = capturedCache!.getCachedState(ref);
    const timestamp1 = state1.boundsTimestamp;

    // Second call immediately - should reuse cache
    const state2 = capturedCache!.getCachedState(ref);

    // Assert
    expect(state1.bounds).toEqual(state2.bounds);
    expect(state2.boundsTimestamp).toBe(timestamp1);
  });

  test('recalculates bounds after cache expires', () => {
    // Arrange
    const mockElement = createMockDOMElement({ left: 10, top: 10, width: 50, height: 50 });
    const ref = { current: mockElement };

    // Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        cacheInvalidationMs={100}
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    expect(capturedCache).toBeDefined();
    // First call
    const state1 = capturedCache!.getCachedState(ref);
    const timestamp1 = state1.boundsTimestamp;

    // Fast forward time past cache invalidation period
    vi.advanceTimersByTime(150);

    // Second call after cache expires - should recalculate
    const state2 = capturedCache!.getCachedState(ref);

    // Assert
    expect(state2.boundsTimestamp).toBeDefined();
    expect(timestamp1).toBeDefined();
    if (state2.boundsTimestamp && timestamp1) {
      expect(state2.boundsTimestamp).toBeGreaterThan(timestamp1);
    }
  });

  test('stores hover state independently of bounds cache', () => {
    // Arrange
    const mockElement = createMockDOMElement({ left: 10, top: 10, width: 50, height: 50 });
    const ref = { current: mockElement };

    // Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        cacheInvalidationMs={100}
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    // Set hover state independently
    capturedCache!.hoverStateRef.current.set(ref, true);

    // First call - get bounds
    const state1 = capturedCache!.getCachedState(ref);
    const timestamp1 = state1.boundsTimestamp;

    // Fast forward and recalculate bounds
    vi.advanceTimersByTime(150);

    const state2 = capturedCache!.getCachedState(ref);

    // Assert - hover state should remain independent
    expect(capturedCache!.hoverStateRef.current.get(ref)).toBe(true);
    expect(state2.boundsTimestamp).toBeDefined();
    expect(timestamp1).toBeDefined();
    if (state2.boundsTimestamp && timestamp1) {
      expect(state2.boundsTimestamp).toBeGreaterThan(timestamp1);
    }
  });

  test('handles null ref gracefully', () => {
    // Arrange
    const ref = { current: null };

    // Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    // Assert cache was created
    expect(capturedCache).toBeDefined();
    const state = capturedCache!.getCachedState(ref);

    // Assert - should not throw and return valid state
    expect(state).toBeDefined();
    expect(capturedCache!.hoverStateRef.current.get(ref)).toBeUndefined();
  });

  test('handles undefined ref gracefully', () => {
    // Arrange
    const ref = { current: undefined };

    // Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    // Assert cache was created
    expect(capturedCache).toBeDefined();
    const state = capturedCache!.getCachedState(ref);

    // Assert - should not throw and return valid state
    expect(state).toBeDefined();
    expect(capturedCache!.hoverStateRef.current.get(ref)).toBeUndefined();
  });

  test('returns different state for different refs', () => {
    // Arrange
    const element1 = createMockDOMElement({ left: 10, top: 10, width: 50, height: 50 });
    const element2 = createMockDOMElement({ left: 100, top: 100, width: 30, height: 30 });
    const ref1 = { current: element1 };
    const ref2 = { current: element2 };

    // Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    expect(capturedCache).toBeDefined();
    const state1 = capturedCache!.getCachedState(ref1);
    const state2 = capturedCache!.getCachedState(ref2);

    // Assert - different refs should have different bounds
    // Note: getBoundingClientRect adds +1 for terminal 1-indexing
    expect(state1.bounds?.left).toBe(11); // 10 + 1
    expect(state2.bounds?.left).toBe(101); // 100 + 1
    expect(state1.bounds).not.toEqual(state2.bounds);
  });

  test('initializes hover state to undefined for new refs', () => {
    // Arrange
    const mockElement = createMockDOMElement({ left: 10, top: 10, width: 50, height: 50 });
    const ref = { current: mockElement };

    // Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    // Assert cache was created
    expect(capturedCache).toBeDefined();
    const state = capturedCache!.getCachedState(ref);

    // Assert - hover state defaults to undefined (false when coerced)
    expect(state).toBeDefined();
    expect(capturedCache!.hoverStateRef.current.get(ref)).toBeUndefined();
  });

  test('works with zero cache invalidation (always recalculate)', () => {
    // Arrange
    const mockElement = createMockDOMElement({ left: 10, top: 10, width: 50, height: 50 });
    const ref = { current: mockElement };

    // Act
    let capturedCache: ReturnType<typeof useElementBoundsCache> | null = null;

    render(
      <TestCacheComponent
        cacheInvalidationMs={0}
        onCacheReady={(cache) => {
          capturedCache = cache;
        }}
      />,
    );

    expect(capturedCache).toBeDefined();
    // First call
    const state1 = capturedCache!.getCachedState(ref);
    const timestamp1 = state1.boundsTimestamp;

    // Advance time by at least 1ms
    vi.advanceTimersByTime(1);

    // Second call - cache is invalid (0ms means always recalculate)
    const state2 = capturedCache!.getCachedState(ref);

    // Assert - should recalculate
    expect(state2.boundsTimestamp).toBeDefined();
    expect(timestamp1).toBeDefined();
    if (state2.boundsTimestamp && timestamp1) {
      expect(state2.boundsTimestamp).toBeGreaterThan(timestamp1);
    }
  });
});
