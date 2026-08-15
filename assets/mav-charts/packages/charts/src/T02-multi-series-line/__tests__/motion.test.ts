import { describe, expect, it } from "vitest";
import { getMultiSeriesLineMotion } from "../motion";
import { resolveMultiSeriesLineAnimation } from "../index";
describe("T02 motion", () => {
  it("supports live, capture and reduced modes", () => {
    expect(resolveMultiSeriesLineAnimation(undefined, false)).toBe(true);
    expect(resolveMultiSeriesLineAnimation(undefined, true)).toBe(false);
    expect(resolveMultiSeriesLineAnimation(false, false)).toBe(false);
    expect(getMultiSeriesLineMotion("signal", true)).toMatchObject({
      isAnimationActive: true,
      animationDuration: 700,
    });
  });
});
