import { describe, expect, it } from "vitest";
import { getTrendLineMotion } from "../motion";
import { resolveTrendLineAnimation } from "../index";

describe("T01 motion", () => {
  it("uses the visual-system entry duration", () => {
    expect(getTrendLineMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 700 });
  });

  it("disables animation for explicit capture and reduced preference", () => {
    expect(resolveTrendLineAnimation(false, false)).toBe(false);
    expect(resolveTrendLineAnimation(undefined, true)).toBe(false);
    expect(resolveTrendLineAnimation(undefined, false)).toBe(true);
  });
});
