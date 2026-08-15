import { describe, expect, it } from "vitest";
import { getStackedColumnMotion } from "../motion";

describe("C04 Stacked Columns motion", () => {
  it("stages the upper segment after the base", () => {
    expect(getStackedColumnMotion("signal", true, 1).animationBegin).toBeGreaterThan(getStackedColumnMotion("signal", true, 0).animationBegin);
    expect(getStackedColumnMotion("signal", true, 0).animationDuration).toBeGreaterThan(0);
  });

  it("fully disables reduced/capture animation", () => {
    expect(getStackedColumnMotion("digital", false, 1)).toEqual({ isAnimationActive: false, animationBegin: 0, animationDuration: 0, animationEasing: "ease-out" });
  });
});
