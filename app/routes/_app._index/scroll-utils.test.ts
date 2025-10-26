import { describe, expect, it } from "vitest";
import { getHorizontalScrollIntent } from "./scroll-utils";

describe("getHorizontalScrollIntent", () => {
  const baseRect = { left: 0, right: 200, width: 200 } as DOMRect;

  it("returns 0 when pointer is centered", () => {
    const intent = getHorizontalScrollIntent({
      pointerX: 100,
      containerRect: baseRect,
      scrollLeft: 0,
      scrollWidth: 400,
    });
    expect(intent).toBe(0);
  });

  it("returns -1 when pointer is near the left boundary and content can scroll left", () => {
    const intent = getHorizontalScrollIntent({
      pointerX: 5,
      containerRect: baseRect,
      scrollLeft: 10,
      scrollWidth: 400,
    });
    expect(intent).toBe(-1);
  });

  it("returns 1 when pointer is near the right boundary and content can scroll right", () => {
    const intent = getHorizontalScrollIntent({
      pointerX: 195,
      containerRect: baseRect,
      scrollLeft: 0,
      scrollWidth: 400,
    });
    expect(intent).toBe(1);
  });

  it("returns 0 when at extreme right edge", () => {
    const intent = getHorizontalScrollIntent({
      pointerX: 195,
      containerRect: baseRect,
      scrollLeft: 200,
      scrollWidth: 200,
    });
    expect(intent).toBe(0);
  });
});
