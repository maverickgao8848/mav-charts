import { describe, expect, it } from "vitest";
import { getGroupedBarMotion } from "../motion";
import { resolveGroupedBarAnimation } from "../index";

describe("C06 motion", () => {
  it("stages both real Recharts series", () => {
    expect(getGroupedBarMotion("signal", true, 0)).toMatchObject({ isAnimationActive: true, animationBegin: 0 });
    expect(getGroupedBarMotion("signal", true, 1)).toMatchObject({ isAnimationActive: true, animationBegin: 90 });
  });
  it("honours capture overrides and reduced motion", () => {
    expect(resolveGroupedBarAnimation(undefined, true)).toBe(false);
    expect(resolveGroupedBarAnimation(true, true)).toBe(true);
    expect(resolveGroupedBarAnimation(false, false)).toBe(false);
  });
});
