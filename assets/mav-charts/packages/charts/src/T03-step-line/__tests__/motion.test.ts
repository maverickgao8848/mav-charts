import { describe, expect, it } from "vitest";
import { resolveStepLineAnimation } from "../index";
import { getStepLineMotion } from "../motion";
describe("T03 motion", () => {
  it("supports live, reduced and capture states", () => {
    expect(resolveStepLineAnimation(undefined, false)).toBe(true);
    expect(resolveStepLineAnimation(undefined, true)).toBe(false);
    expect(resolveStepLineAnimation(false, false)).toBe(false);
    expect(getStepLineMotion("signal", true)).toMatchObject({
      isAnimationActive: true,
      animationDuration: 700,
    });
  });
});
