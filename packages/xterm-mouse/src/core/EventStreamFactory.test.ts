import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, test } from 'vitest';
import type { MouseEvent } from '../types';
import { EventStreamFactory } from './EventStreamFactory';

describe('EventStreamFactory', () => {
  let factory: EventStreamFactory;
  let mockEmitter: EventEmitter;

  beforeEach(() => {
    mockEmitter = new EventEmitter();
    factory = new EventStreamFactory(mockEmitter);
  });

  describe('eventsOf', () => {
    test('yields events of specified type', async () => {
      // Arrange
      const events: MouseEvent[] = [];
      const stream = factory.eventsOf('press');

      // Act - start consuming the stream
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          mockEmitter.emit('press', { x: 10, y: 10, button: 'left', action: 'press' });
          mockEmitter.emit('press', { x: 15, y: 15, button: 'left', action: 'press' });
          setTimeout(() => resolve(), 10);
        }, 10);
      });

      // Consume stream
      const consumingPromise = (async () => {
        for await (const event of stream) {
          events.push(event);
          if (events.length >= 2) break;
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);

      // Assert
      expect(events).toHaveLength(2);
      expect(events[0]).toEqual(expect.objectContaining({ action: 'press' }));
    });

    test('ignores events of other types', async () => {
      // Arrange
      const events: MouseEvent[] = [];
      const stream = factory.eventsOf('press');

      // Act
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          mockEmitter.emit('release', { x: 10, y: 10, button: 'left', action: 'release' });
          mockEmitter.emit('press', { x: 15, y: 15, button: 'left', action: 'press' });
          setTimeout(() => resolve(), 10);
        }, 10);
      });

      const consumingPromise = (async () => {
        for await (const event of stream) {
          events.push(event);
          if (events.length >= 1) break;
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0]?.action).toBe('press');
    });

    test('aborts when signal is triggered', async () => {
      // Arrange
      const controller = new AbortController();
      const stream = factory.eventsOf('press', { signal: controller.signal });
      const events: MouseEvent[] = [];

      // Act
      const consumingPromise = (async () => {
        try {
          for await (const event of stream) {
            events.push(event);
          }
        } catch (err) {
          // Expected to abort
          expect(err).toBeInstanceOf(Error);
          expect((err as Error).message).toContain('aborted');
        }
      })();

      setTimeout(() => {
        controller.abort();
      }, 10);

      await consumingPromise;

      // Assert
      expect(events.length).toBe(0); // No events collected before abort
    });

    test('cleans up listeners on break', async () => {
      // Arrange
      const stream = factory.eventsOf('press');
      const listenerCount = mockEmitter.listenerCount('press');

      // Act
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          mockEmitter.emit('press', { x: 10, y: 10, button: 'left', action: 'press' });
          setTimeout(() => resolve(), 10);
        }, 10);
      });

      const consumingPromise = (async () => {
        for await (const _ of stream) {
          break; // Exit after first event
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);
      const finalListenerCount = mockEmitter.listenerCount('press');

      // Assert - listener removed
      expect(finalListenerCount).toBe(listenerCount);
    });
  });

  describe('debouncedMoveEvents', () => {
    test('yields debounced move events', async () => {
      // Arrange
      const events: MouseEvent[] = [];
      const stream = factory.debouncedMoveEvents({ interval: 50 });

      // Act
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          // Emit multiple move events rapidly
          mockEmitter.emit('move', { x: 10, y: 10, button: 'none', action: 'move' });
          mockEmitter.emit('move', { x: 15, y: 15, button: 'none', action: 'move' });
          mockEmitter.emit('move', { x: 20, y: 20, button: 'none', action: 'move' });
          setTimeout(() => resolve(), 100); // Wait for debounce interval
        }, 10);
      });

      const consumingPromise = (async () => {
        for await (const event of stream) {
          events.push(event);
          if (events.length >= 1) break; // Just get first debounced event
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);

      // Assert - should get last event after debounce
      expect(events).toHaveLength(1);
      expect(events[0]).toEqual(
        expect.objectContaining({
          x: 20,
          y: 20,
          action: 'move',
        }),
      );
    });

    test('ignores non-move events', async () => {
      // Arrange
      const events: MouseEvent[] = [];
      const stream = factory.debouncedMoveEvents({ interval: 50 });

      // Act
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          mockEmitter.emit('press', { x: 10, y: 10, button: 'left', action: 'press' });
          mockEmitter.emit('move', { x: 15, y: 15, button: 'none', action: 'move' });
          setTimeout(() => resolve(), 100);
        }, 10);
      });

      const consumingPromise = (async () => {
        for await (const event of stream) {
          events.push(event);
          if (events.length >= 1) break;
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);

      // Assert
      expect(events).toHaveLength(1);
      expect(events[0]?.action).toBe('move');
    });

    test('aborts when signal is triggered', async () => {
      // Arrange
      const controller = new AbortController();
      const stream = factory.debouncedMoveEvents({ signal: controller.signal });
      const events: MouseEvent[] = [];

      // Act
      const consumingPromise = (async () => {
        try {
          for await (const event of stream) {
            events.push(event);
          }
        } catch (err) {
          expect((err as Error).message).toContain('aborted');
        }
      })();

      setTimeout(() => {
        controller.abort();
      }, 10);

      await consumingPromise;

      // Assert
      expect(events.length).toBe(0);
    });
  });

  describe('stream', () => {
    test('yields all event types with wrappers', async () => {
      // Arrange
      const events: { type: string; event: MouseEvent }[] = [];
      const stream = factory.stream();

      // Act
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          mockEmitter.emit('press', { x: 10, y: 10, button: 'left', action: 'press' });
          mockEmitter.emit('move', { x: 15, y: 15, button: 'none', action: 'move' });
          setTimeout(() => resolve(), 10);
        }, 10);
      });

      const consumingPromise = (async () => {
        for await (const wrapped of stream) {
          events.push(wrapped);
          if (events.length >= 2) break;
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);

      // Assert
      expect(events).toHaveLength(2);
      expect(events[0]).toEqual({ type: 'press', event: expect.objectContaining({ action: 'press' }) });
      expect(events[1]).toEqual({ type: 'move', event: expect.objectContaining({ action: 'move' }) });
    });

    test('cleans up all event listeners on completion', async () => {
      // Arrange
      const stream = factory.stream();
      const initialPressListeners = mockEmitter.listenerCount('press');
      const initialMoveListeners = mockEmitter.listenerCount('move');

      // Act
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          mockEmitter.emit('press', { x: 10, y: 10, button: 'left', action: 'press' });
          setTimeout(() => resolve(), 10);
        }, 10);
      });

      const consumingPromise = (async () => {
        for await (const _ of stream) {
          break;
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);
      const finalPressListeners = mockEmitter.listenerCount('press');
      const finalMoveListeners = mockEmitter.listenerCount('move');

      // Assert - all temporary listeners removed
      expect(finalPressListeners).toBe(initialPressListeners);
      expect(finalMoveListeners).toBe(initialMoveListeners);
    });

    test('aborts when signal is triggered', async () => {
      // Arrange
      const controller = new AbortController();
      const stream = factory.stream({ signal: controller.signal });
      const events: { type: string; event: MouseEvent }[] = [];

      // Act
      const consumingPromise = (async () => {
        try {
          for await (const wrapped of stream) {
            events.push(wrapped);
          }
        } catch (err) {
          expect((err as Error).message).toContain('aborted');
        }
      })();

      setTimeout(() => {
        controller.abort();
      }, 10);

      await consumingPromise;

      // Assert
      expect(events.length).toBe(0);
    });
  });

  describe('error handling', () => {
    test('eventsOf throws error when error event is emitted', async () => {
      // Arrange
      const stream = factory.eventsOf('press');

      // Act
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          // Emit error first, then an event to trigger next iteration
          mockEmitter.emit('error', new Error('Stream error'));
          mockEmitter.emit('press', { x: 10, y: 10, button: 'left', action: 'press' });
          setTimeout(() => resolve(), 10);
        }, 10);
      });

      const consumingPromise = (async () => {
        try {
          for await (const _ of stream) {
            // Should throw before yielding
          }
        } catch (err) {
          expect((err as Error).message).toContain('Stream error');
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);
    });

    test('debouncedMoveEvents throws error when error event is emitted', async () => {
      // Arrange
      const stream = factory.debouncedMoveEvents();

      // Act
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          // Emit error first, then a move event to trigger next iteration
          mockEmitter.emit('error', new Error('Debounce error'));
          mockEmitter.emit('move', { x: 10, y: 10, button: 'none', action: 'move' });
          setTimeout(() => resolve(), 10);
        }, 10);
      });

      const consumingPromise = (async () => {
        try {
          for await (const _ of stream) {
            // Should throw before yielding
          }
        } catch (err) {
          expect((err as Error).message).toContain('Debounce error');
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);
    });

    test('stream throws error when error event is emitted', async () => {
      // Arrange
      const stream = factory.stream();

      // Act
      const setTimeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          // Emit error first, then an event to trigger next iteration
          mockEmitter.emit('error', new Error('All events error'));
          mockEmitter.emit('press', { x: 10, y: 10, button: 'left', action: 'press' });
          setTimeout(() => resolve(), 10);
        }, 10);
      });

      const consumingPromise = (async () => {
        try {
          for await (const _ of stream) {
            // Should throw before yielding
          }
        } catch (err) {
          expect((err as Error).message).toContain('All events error');
        }
      })();

      await Promise.all([setTimeoutPromise, consumingPromise]);
    });
  });
});
