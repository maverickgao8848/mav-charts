import { describe, expect, it } from "vitest";
import { pieEdgeCases, pieExample } from "../example-data";
import { buildPieGeometry, getPieAngle, validatePieData } from "../schema";

describe("P01 pie schema and geometry", () => {
  it("accepts a positive known whole with explicit missing and zero", () => { expect(validatePieData(pieExample).valid).toBe(true); expect(validatePieData(pieEdgeCases.missing).valid).toBe(true); expect(validatePieData(pieEdgeCases.zero).valid).toBe(true); });
  it("rejects undefined wholes, negative, duplicate, nonfinite and blank data", () => { for (const data of [pieEdgeCases.allZero, pieEdgeCases.allMissing, pieEdgeCases.negative, pieEdgeCases.duplicate, pieEdgeCases.nonfinite, pieEdgeCases.blank]) expect(validatePieData(data).valid).toBe(false); });
  it("maps values linearly to exact angles summing to 360", () => { const geometry = buildPieGeometry(pieExample); expect(geometry[0].angle).toBeCloseTo(151.2, 10); expect(geometry[1].angle).toBeCloseTo(118.8, 10); expect(geometry[2].angle).toBeCloseTo(90, 10); expect(geometry.reduce((sum, datum) => sum + datum.angle, 0)).toBeCloseTo(360, 10); expect(getPieAngle(25, 100)).toBe(90); });
  it("preserves input order and focuses the first positive slice", () => { const geometry = buildPieGeometry(pieEdgeCases.zero); expect(geometry.map(({ label }) => label)).toEqual(["Primary", "No contribution", "Secondary"]); expect(geometry.map(({ focus }) => focus)).toEqual([true, false, false]); });
  it("gives missing and zero no angle without conflating their semantics", () => { const missing = buildPieGeometry(pieEdgeCases.missing)[1], zero = buildPieGeometry(pieEdgeCases.zero)[1]; expect(missing).toMatchObject({ value: null, missing: true, zero: false, share: null, angle: 0 }); expect(zero).toMatchObject({ value: 0, missing: false, zero: true, share: 0, angle: 0 }); });
  it("keeps extreme ratios truthful", () => { const geometry = buildPieGeometry(pieEdgeCases.extreme); expect(geometry[1].share).toBeCloseTo(1e-9, 12); expect(geometry[1].angle).toBeGreaterThan(0); });
});
