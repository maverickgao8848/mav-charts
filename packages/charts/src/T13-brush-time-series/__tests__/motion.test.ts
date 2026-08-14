import { describe, expect, it } from "vitest";
import { getBrushTimeSeriesMotion } from "../motion";

describe("T13 Brush Time Series motion", () => {
  it("enables observable Recharts entry motion", () => {
    expect(getBrushTimeSeriesMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 520 });
    expect(getBrushTimeSeriesMotion("digital", true).animationDuration).toBe(1100);
  });

  it("uses a deterministic static frame when disabled", () => {
    expect(getBrushTimeSeriesMotion("editorial", false)).toMatchObject({ isAnimationActive: false, animationDuration: 0 });
  });
});

