import { describe, expect, it } from "vitest";
import { resolveValueDotLineAnimation } from "../index";
import { getValueDotLineMotion } from "../motion";

describe("T04 motion", () => {
  it("uses the visual-system entry duration", () => {
    expect(getValueDotLineMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 700 });
  });

  it("disables animation for explicit capture and reduced preference", () => {
    expect(resolveValueDotLineAnimation(false, false)).toBe(false);
    expect(resolveValueDotLineAnimation(undefined, true)).toBe(false);
    expect(resolveValueDotLineAnimation(undefined, false)).toBe(true);
  });
});
