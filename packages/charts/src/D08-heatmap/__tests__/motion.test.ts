import { describe, expect, it } from "vitest";
import { getHeatmapCellMotion } from "../motion";

describe("D08 Heatmap motion", () => {
  it("provides deterministic staggered cell entry", () => {
    expect(getHeatmapCellMotion("signal", true, 0)).toMatchObject({ animate: true, durationMs: 520, delayMs: 0 });
    expect(getHeatmapCellMotion("signal", true, 2).delayMs).toBeGreaterThan(0);
    expect(getHeatmapCellMotion("digital", true, 100).delayMs).toBe(getHeatmapCellMotion("digital", true, 24).delayMs);
  });

  it("removes duration and delay when disabled", () => {
    expect(getHeatmapCellMotion("editorial", false, 8)).toEqual({ animate: false, durationMs: 0, delayMs: 0 });
  });
});

