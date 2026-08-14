import { describe, expect, it } from "vitest";
import { getRadialProgressMotion } from "../motion";

describe("P04 Radial Progress motion", () => {
  it("enables observable Recharts radial entry motion", () => {
    expect(getRadialProgressMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 520 });
    expect(getRadialProgressMotion("digital", true).animationDuration).toBe(1100);
  });

  it("uses a deterministic static frame when disabled", () => {
    expect(getRadialProgressMotion("editorial", false)).toMatchObject({ isAnimationActive: false, animationDuration: 0 });
  });
});

