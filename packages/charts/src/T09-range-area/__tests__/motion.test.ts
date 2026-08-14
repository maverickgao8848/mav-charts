import { describe, expect, it } from "vitest";
import { getRangeAreaMotion } from "../motion";

describe("T09 Range Area motion", () => {
  it("enables an observable Recharts animation for normal motion", () => {
    expect(getRangeAreaMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 520 });
    expect(getRangeAreaMotion("digital", true).animationDuration).toBe(1100);
  });

  it("uses a deterministic static frame when animation is disabled", () => {
    expect(getRangeAreaMotion("editorial", false)).toMatchObject({ isAnimationActive: false, animationDuration: 0 });
  });
});
