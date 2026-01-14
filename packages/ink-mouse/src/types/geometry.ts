/**
 * DOMRect type - browser standard for element bounding box
 */
export type DOMRect = {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly top: number;
  readonly right: number;
  readonly bottom: number;
  readonly left: number;
};

/**
 * Alias for DOMRect - used for element bounding client rectangle
 */
export type BoundingClientRect = DOMRect;
