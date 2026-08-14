import { describe, expect, it } from "vitest";
import { needleGaugeEdgeCases, needleGaugeExample } from "../example-data";
import { buildNeedleGaugeGeometry, mapGaugeAngle, mapNeedleRotation, validateNeedleGaugeData } from "../schema";

describe("P05 needle gauge schema and geometry", () => {
  it("accepts finite declared and negative ranges", () => { expect(validateNeedleGaugeData(needleGaugeExample).valid).toBe(true); expect(validateNeedleGaugeData(needleGaugeEdgeCases.negativeRange).valid).toBe(true); });
  it("rejects missing/nonfinite/out-of-range values and invalid ranges", () => { for (const data of [needleGaugeEdgeCases.missing, needleGaugeEdgeCases.nonfinite, needleGaugeEdgeCases.belowRange, needleGaugeEdgeCases.aboveRange, needleGaugeEdgeCases.equalRange]) expect(validateNeedleGaugeData(data).valid).toBe(false); });
  it("rejects unordered or uncovered thresholds", () => { expect(validateNeedleGaugeData(needleGaugeEdgeCases.unordered).valid).toBe(false); expect(validateNeedleGaugeData(needleGaugeEdgeCases.uncovered).valid).toBe(false); });
  it("maps value linearly across the full semicircle", () => { expect(mapGaugeAngle(0, 0, 100)).toBe(180); expect(mapGaugeAngle(50, 0, 100)).toBe(90); expect(mapGaugeAngle(100, 0, 100)).toBe(0); expect(mapNeedleRotation(0, 0, 100)).toBe(-90); expect(mapNeedleRotation(100, 0, 100)).toBe(90); });
  it("preserves exact band extents and identifies the current band", () => { const geometry = buildNeedleGaugeGeometry(needleGaugeExample); expect(geometry.bands.map(({ span }) => span)).toEqual([40, 35, 25]); expect(geometry.bands.map(({ startAngle, endAngle }) => [startAngle, endAngle])).toEqual([[180, 108], [108, 45], [45, 0]]); expect(geometry.bands.map(({ containsValue }) => containsValue)).toEqual([false, true, false]); expect(geometry.needleAngle).toBeCloseTo(50.4, 10); });
  it("maps a negative interval without clamping", () => { const geometry = buildNeedleGaugeGeometry(needleGaugeEdgeCases.negativeRange); expect(geometry.ratio).toBeCloseTo(28 / 60, 10); expect(geometry.needleAngle).toBeCloseTo(96, 10); expect(geometry.bands[1].containsValue).toBe(true); });
});

