import { describe, expect, it } from "vitest";
import { getBubbleQuadrantMotion } from "../motion";

describe("D03 Bubble Quadrant motion", () => {
  it("enables observable Recharts entry motion", () => {
    expect(getBubbleQuadrantMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 520 });
    expect(getBubbleQuadrantMotion("digital", true).animationDuration).toBe(1100);
  });

  it("uses a deterministic static frame when disabled", () => {
    expect(getBubbleQuadrantMotion("editorial", false)).toMatchObject({ isAnimationActive: false, animationDuration: 0 });
  });
});

