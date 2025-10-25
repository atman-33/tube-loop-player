export interface HorizontalScrollIntentInput {
  pointerX: number;
  containerRect: Pick<DOMRect, "left" | "right" | "width">;
  scrollLeft: number;
  scrollWidth: number;
}

/**
 * Returns -1 for left scroll, 1 for right scroll, or 0 for no scroll intent.
 */
export const getHorizontalScrollIntent = ({
  pointerX,
  containerRect,
  scrollLeft,
  scrollWidth,
}: HorizontalScrollIntentInput): -1 | 0 | 1 => {
  if (!Number.isFinite(pointerX) || containerRect.width <= 0) {
    return 0;
  }

  const maxScrollableDistance = Math.max(scrollWidth - containerRect.width, 0);
  if (maxScrollableDistance === 0) {
    return 0;
  }

  const threshold = Math.max(24, Math.min(containerRect.width * 0.2, 80));
  const leftBoundary = containerRect.left + threshold;
  const rightBoundary = containerRect.right - threshold;

  if (pointerX < leftBoundary && scrollLeft > 0) {
    return -1;
  }

  if (pointerX > rightBoundary && scrollLeft < maxScrollableDistance) {
    return 1;
  }

  return 0;
};
