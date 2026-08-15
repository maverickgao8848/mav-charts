import { describe, expect, it } from "vitest";
import { resolveMultiSeriesAreaAnimation } from "../index";
import { getMultiSeriesAreaMotion } from "../motion";
describe("T07 motion", () => {
  it("supports live reduced and capture", () => {
    expect(resolveMultiSeriesAreaAnimation(undefined, false)).toBe(true);
    expect(resolveMultiSeriesAreaAnimation(undefined, true)).toBe(false);
    expect(resolveMultiSeriesAreaAnimation(false, false)).toBe(false);
    expect(getMultiSeriesAreaMotion("signal", true)).toMatchObject({
      isAnimationActive: true,
      animationDuration: 700,
    });
  });
});
