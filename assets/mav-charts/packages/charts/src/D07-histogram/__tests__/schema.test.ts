import { describe, expect, it } from "vitest";
import { buildHistogramGeometry, getHistogramBarWidth, getHistogramYDomain, mapHistogramY, validateHistogramBins } from "../schema";
import { histogramEdgeCases, histogramExample } from "../example-data";
describe("D07 histogram geometry", () => {
  it("accepts ordered continuous equal-width pre-binned input", () => expect(validateHistogramBins(histogramExample).valid).toBe(true));
  it("rejects gaps, overlap, unequal width and duplicates", () => { for (const data of [histogramEdgeCases.invalidGap, histogramEdgeCases.overlap, histogramEdgeCases.unequalWidth, histogramEdgeCases.duplicate]) expect(validateHistogramBins(data).valid).toBe(false); });
  it("accepts nonnegative integer/null counts and rejects negative/noninteger/nonfinite", () => { expect(validateHistogramBins(histogramEdgeCases.missing).valid).toBe(true); expect(validateHistogramBins(histogramEdgeCases.zeroCount).valid).toBe(true); for (const data of [histogramEdgeCases.negativeCount, histogramEdgeCases.noninteger, histogramEdgeCases.nonfinite]) expect(validateHistogramBins(data).valid).toBe(false); });
  it("keeps null as missing rather than zero", () => { const missing = buildHistogramGeometry(histogramEdgeCases.missing)[1]; expect(missing).toMatchObject({ missing: true, count: null, plotValue: 0 }); });
  it("marks only the first highest bin when peaks tie", () => expect(buildHistogramGeometry(histogramEdgeCases.ties).map(({ peak }) => peak)).toEqual([true, false, false]));
  it("uses a zero-based padded count domain", () => { expect(getHistogramYDomain(histogramExample)).toEqual([0, 29.700000000000003]); expect(getHistogramYDomain(histogramEdgeCases.zeroCount)).toEqual([0, 5.5]); expect(getHistogramYDomain([{ start: 0, end: 1, count: 0 }])).toEqual([0, 1]); });
  it("maps counts and equal visual bin width honestly", () => { expect(mapHistogramY(5, [0, 10], [300, 100])).toBe(200); expect(getHistogramBarWidth(4, 800)).toBe(184); });
});
