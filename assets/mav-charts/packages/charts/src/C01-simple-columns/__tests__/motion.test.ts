import { describe, expect, it } from "vitest";
import { getSimpleColumnMotion } from "../motion";

describe("C01 Simple Columns motion", () => {
  it("enables an observable Recharts column entry", () => {
    expect(getSimpleColumnMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 520 });
    expect(getSimpleColumnMotion("digital", true).animationDuration).toBe(1100);
  });

  it("uses a deterministic static frame when disabled", () => {
    expect(getSimpleColumnMotion("editorial", false)).toMatchObject({ isAnimationActive: false, animationDuration: 0 });
  });
});

