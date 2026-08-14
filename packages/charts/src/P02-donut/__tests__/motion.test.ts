import { describe, expect, it } from "vitest";
import { getDonutMotion } from "../motion";
import { resolveDonutAnimation } from "../index";
describe("P02 motion", () => {
  it("uses real Pie entry motion", () => {
    expect(getDonutMotion("signal", true)).toMatchObject({
      isAnimationActive: true,
      animationDuration: 620,
    });
  });
  it("honors explicit and reduced motion", () => {
    expect(resolveDonutAnimation(undefined, true)).toBe(false);
    expect(resolveDonutAnimation(true, true)).toBe(true);
  });
});
