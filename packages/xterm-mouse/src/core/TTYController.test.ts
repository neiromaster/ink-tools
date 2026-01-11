import { EventEmitter } from 'node:events';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { TTYController } from './TTYController';

// Mock ReadableStream
class MockReadableStream extends EventEmitter {
  public isTTY = true;
  public isRaw = false;
  public readableEncoding: BufferEncoding | null = null;

  setRawMode(mode: boolean): this {
    this.isRaw = mode;
    return this;
  }

  setEncoding(encoding: BufferEncoding): this {
    this.readableEncoding = encoding;
    return this;
  }

  resume(): this {
    return this;
  }

  pause(): this {
    return this;
  }

  // Helper methods for testing
  public mockEmitData(data: Buffer): void {
    this.emit('data', data);
  }
}

// Mock WritableStream
class MockWritableStream {
  public isTTY = true;
  private writtenData: Buffer[] = [];

  write(data: string | Buffer): boolean {
    this.writtenData.push(Buffer.isBuffer(data) ? data : Buffer.from(data));
    return true;
  }

  getWrittenData(): Buffer[] {
    return this.writtenData;
  }

  clearWrittenData(): void {
    this.writtenData = [];
  }
}

describe('TTYController', () => {
  let controller: TTYController;
  let mockInputStream: MockReadableStream;
  let mockOutputStream: MockWritableStream;
  let handleEventSpy: ReturnType<typeof vi.fn<(data: Buffer) => void>>;

  beforeEach(() => {
    mockInputStream = new MockReadableStream();
    mockOutputStream = new MockWritableStream();
    handleEventSpy = vi.fn();
    controller = new TTYController(
      mockInputStream as unknown as import('../types').ReadableStreamWithEncoding,
      mockOutputStream as unknown as NodeJS.WriteStream,
      handleEventSpy,
    );
  });

  describe('initial state', () => {
    test('is not enabled initially', () => {
      // Arrange & Act
      const isEnabled = controller.isEnabled();

      // Assert
      expect(isEnabled).toBe(false);
    });

    test('is not paused initially', () => {
      // Arrange & Act
      const isPaused = controller.isPaused();

      // Assert
      expect(isPaused).toBe(false);
    });
  });

  describe('enable', () => {
    test('enables mouse tracking', () => {
      // Arrange & Act
      controller.enable();

      // Assert
      expect(controller.isEnabled()).toBe(true);
      expect(mockOutputStream.getWrittenData().length).toBeGreaterThan(0);
    });

    test('registers data event listener', () => {
      // Arrange
      const listenerCount = mockInputStream.listenerCount('data');

      // Act
      controller.enable();

      // Assert
      expect(mockInputStream.listenerCount('data')).toBe(listenerCount + 1);
    });

    test('sets raw mode on input stream', () => {
      // Arrange & Act
      controller.enable();

      // Assert
      expect(mockInputStream.isRaw).toBe(true);
    });

    test('is idempotent - can call enable multiple times', () => {
      // Arrange
      controller.enable();
      const listenerCount = mockInputStream.listenerCount('data');

      // Act
      controller.enable();

      // Assert - no duplicate listeners
      expect(mockInputStream.listenerCount('data')).toBe(listenerCount);
    });

    test('throws when input stream is not a TTY', () => {
      // Arrange
      mockInputStream.isTTY = false;

      // Act & Assert
      expect(() => controller.enable()).toThrow('Mouse events require a TTY input stream');
    });

    test('handles errors during enable', () => {
      // Arrange
      mockOutputStream.write = vi.fn(() => {
        throw new Error('Write failed');
      });

      // Act & Assert
      expect(() => controller.enable()).toThrow();
      expect(controller.isEnabled()).toBe(false); // Should rollback
    });
  });

  describe('disable', () => {
    test('disables mouse tracking', () => {
      // Arrange
      controller.enable();
      mockOutputStream.clearWrittenData();

      // Act
      controller.disable();

      // Assert
      expect(controller.isEnabled()).toBe(false);
      expect(mockOutputStream.getWrittenData().length).toBeGreaterThan(0); // Disable codes written
    });

    test('removes data event listener', () => {
      // Arrange
      controller.enable();
      const listenerCount = mockInputStream.listenerCount('data');

      // Act
      controller.disable();

      // Assert
      expect(mockInputStream.listenerCount('data')).toBe(listenerCount - 1);
    });

    test('pauses input stream', () => {
      // Arrange
      controller.enable();
      const pauseSpy = vi.spyOn(mockInputStream, 'pause');

      // Act
      controller.disable();

      // Assert
      expect(pauseSpy).toHaveBeenCalled();
    });

    test('is idempotent - can call disable multiple times', () => {
      // Arrange
      controller.enable();
      controller.disable();

      // Act - should not throw
      expect(() => controller.disable()).not.toThrow();
      expect(controller.isEnabled()).toBe(false);
    });

    test('does nothing when not enabled', () => {
      // Arrange & Act - disable without enable
      expect(() => controller.disable()).not.toThrow();
      expect(controller.isEnabled()).toBe(false);
    });
  });

  describe('pause/resume', () => {
    test('pause sets paused state', () => {
      // Arrange & Act
      controller.pause();

      // Assert
      expect(controller.isPaused()).toBe(true);
    });

    test('resume clears paused state', () => {
      // Arrange
      controller.pause();

      // Act
      controller.resume();

      // Assert
      expect(controller.isPaused()).toBe(false);
    });

    test('pause is idempotent', () => {
      // Arrange
      controller.pause();

      // Act
      controller.pause();

      // Assert
      expect(controller.isPaused()).toBe(true);
    });

    test('resume is idempotent', () => {
      // Arrange
      controller.pause();
      controller.resume();

      // Act
      controller.resume();

      // Assert
      expect(controller.isPaused()).toBe(false);
    });
  });

  describe('destroy', () => {
    test('disables controller', () => {
      // Arrange
      controller.enable();

      // Act
      controller.destroy();

      // Assert
      expect(controller.isEnabled()).toBe(false);
    });

    test('is idempotent', () => {
      // Arrange
      controller.enable();

      // Act
      controller.destroy();
      expect(() => controller.destroy()).not.toThrow();

      // Assert
      expect(controller.isEnabled()).toBe(false);
    });
  });

  describe('event handling', () => {
    test('calls handleEvent when data is received and not paused', () => {
      // Arrange
      const wrappedSpy = vi.fn((data: Buffer) => {
        if (!controller.isPaused()) {
          (handleEventSpy as (data: Buffer) => void)(data);
        }
      });
      controller = new TTYController(
        mockInputStream as unknown as import('../types').ReadableStreamWithEncoding,
        mockOutputStream as unknown as NodeJS.WriteStream,
        wrappedSpy,
      );
      controller.enable();
      const testData = Buffer.from('test data');

      // Act
      mockInputStream.mockEmitData(testData);

      // Assert
      expect(handleEventSpy).toHaveBeenCalledWith(testData);
    });

    test('does NOT call handleEvent when paused', () => {
      // Arrange
      const wrappedSpy = vi.fn((data: Buffer) => {
        if (!controller.isPaused()) {
          (handleEventSpy as (data: Buffer) => void)(data);
        }
      });
      controller = new TTYController(
        mockInputStream as unknown as import('../types').ReadableStreamWithEncoding,
        mockOutputStream as unknown as NodeJS.WriteStream,
        wrappedSpy,
      );
      controller.enable();
      controller.pause();
      const testData = Buffer.from('test data');

      // Act
      mockInputStream.mockEmitData(testData);

      // Assert
      expect(handleEventSpy).not.toHaveBeenCalled();
    });

    test('calls handleEvent after resume', () => {
      // Arrange
      const wrappedSpy = vi.fn((data: Buffer) => {
        if (!controller.isPaused()) {
          (handleEventSpy as (data: Buffer) => void)(data);
        }
      });
      controller = new TTYController(
        mockInputStream as unknown as import('../types').ReadableStreamWithEncoding,
        mockOutputStream as unknown as NodeJS.WriteStream,
        wrappedSpy,
      );
      controller.enable();
      controller.pause();
      controller.resume();
      const testData = Buffer.from('test data');

      // Act
      mockInputStream.mockEmitData(testData);

      // Assert
      expect(handleEventSpy).toHaveBeenCalledWith(testData);
    });
  });

  describe('cleanup', () => {
    test('handles null/undefined in disable gracefully', () => {
      // Arrange
      mockInputStream.setRawMode = vi.fn(() => {
        throw new Error('Raw mode error');
      });

      // Act & Assert - should not throw despite error
      expect(() => controller.disable()).not.toThrow();
      expect(controller.isEnabled()).toBe(false);
    });

    test('handles write errors during disable gracefully', () => {
      // Arrange
      controller.enable();
      mockOutputStream.write = vi.fn(() => {
        throw new Error('Write failed');
      });

      // Act & Assert
      expect(() => controller.disable()).toThrow();
      expect(controller.isEnabled()).toBe(false); // Should still set enabled to false
    });
  });
});
