import { describe, expect, it } from "vitest";
import { funnelEdgeCases, funnelExample } from "../example-data";
import { buildFunnelGeometry, getFunnelWidthRatio, mapFunnelWidth, validateFunnelData } from "../schema";

describe("F04 funnel schema and geometry", () => {
  it("accepts ordered non-increasing stages", () => expect(validateFunnelData(funnelExample).valid).toBe(true));
  it("accepts explicit missing and zero stages", () => { expect(validateFunnelData(funnelEdgeCases.missing).valid).toBe(true); expect(validateFunnelData(funnelEdgeCases.zero).valid).toBe(true); });
  it("rejects negative, increasing, duplicate, nonfinite and blank input", () => { for (const data of [funnelEdgeCases.negative, funnelEdgeCases.increasing, funnelEdgeCases.duplicate, funnelEdgeCases.nonfinite, funnelEdgeCases.blank]) expect(validateFunnelData(data).valid).toBe(false); });
  it("maps stage boundary width linearly to value", () => { expect(getFunnelWidthRatio(620, 1000)).toBe(0.62); expect(mapFunnelWidth(310, 1000, 800)).toBe(248); });
  it("preserves missing as a categorical-only break without synthesizing width", () => { const missing = buildFunnelGeometry(funnelEdgeCases.missing)[1], zero = buildFunnelGeometry(funnelEdgeCases.zero)[2]; expect(missing).toMatchObject({ value: null, missing: true, layoutWeight: 1, widthRatio: null, nextWidthRatio: null, conversionFromPrevious: null, lossFromPrevious: null, dropToNext: null }); expect(missing).not.toHaveProperty("plotValue"); expect(zero).toMatchObject({ value: 0, missing: false, widthRatio: 0 }); });
  it("does not bridge quantitative widths across a missing stage", () => { const geometry = buildFunnelGeometry(funnelEdgeCases.missing); expect(geometry[0].nextWidthRatio).toBeNull(); expect(geometry[2].widthRatio).toBe(0.2); expect(geometry.map(({ layoutWeight }) => layoutWeight)).toEqual([1, 1, 1]); });
  it("calculates adjacent conversion and loss", () => { const geometry = buildFunnelGeometry(funnelExample); expect(geometry[1]).toMatchObject({ conversionFromPrevious: 0.62, lossFromPrevious: 380 }); expect(geometry[2]).toMatchObject({ conversionFromPrevious: 0.5, lossFromPrevious: 310 }); });
  it("focuses only the first largest loss when tied", () => expect(buildFunnelGeometry(funnelEdgeCases.ties).map(({ focus }) => focus)).toEqual([true, false, false]));
  it("does not invent a loss focus for a flat funnel", () => expect(buildFunnelGeometry(funnelEdgeCases.flat).some(({ focus }) => focus)).toBe(false));
});
