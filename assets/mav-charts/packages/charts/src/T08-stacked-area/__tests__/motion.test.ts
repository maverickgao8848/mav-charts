import { describe, expect, it } from "vitest";
import { resolveStackedAreaAnimation } from "../index";
import { getStackedAreaMotion } from "../motion";
describe("T08 motion", () => {
  it("supports staggered live reduced and capture", () => {
    expect(resolveStackedAreaAnimation(undefined, false)).toBe(true);
    expect(resolveStackedAreaAnimation(undefined, true)).toBe(false);
    expect(resolveStackedAreaAnimation(false, false)).toBe(false);
    expect(getStackedAreaMotion("signal", true, 1)).toMatchObject({
      isAnimationActive: true,
      animationBegin: 90,
      animationDuration: 820,
    });
  });
});
