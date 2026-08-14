import { describe, expect, it } from "vitest";
import { getRoundedColumnMotion } from "../motion";

describe("C02 Rounded Columns motion", () => {
  it("exposes real entry motion when enabled", () => {
    expect(getRoundedColumnMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: expect.any(Number), animationEasing: "ease-out" });
    expect(getRoundedColumnMotion("signal", true).animationDuration).toBeGreaterThan(0);
  });

  it("is deterministic when capture or reduced motion disables animation", () => {
    expect(getRoundedColumnMotion("editorial", false)).toEqual({ isAnimationActive: false, animationDuration: 0, animationEasing: "ease-out" });
  });
});
