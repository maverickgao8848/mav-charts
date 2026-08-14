import { describe, expect, it } from "vitest";
import { percentAreaEdgeCases, percentAreaExample } from "../example-data";
import { buildPercentAreaGeometry, buildPercentAreaSegments, getPercentAreaPair, mapPercentAreaX, mapPercentAreaY, validatePercentAreaData } from "../schema";
describe("T11 percent area geometry", () => {
  it("normalizes complete rows while retaining raw magnitude", () => { const row = buildPercentAreaGeometry([{ label: "A", value: 2, comparison: 3 }])[0]; expect(row).toMatchObject({ total: 5, valueShare: .4, comparisonShare: .6, chartValue: 40, chartComparison: 60, valuePercent: 40, comparisonPercent: 60 }); });
  it("keeps display pairs complementary", () => { expect(getPercentAreaPair(1 / 3)).toEqual([33, 67]); for (const row of buildPercentAreaGeometry(percentAreaExample)) expect(row.valuePercent! + row.comparisonPercent!).toBe(100); });
  it("turns either missing part into a whole gap", () => { expect(buildPercentAreaGeometry(percentAreaEdgeCases.missingValue)[1]).toMatchObject({ complete: false, chartValue: null, chartComparison: null }); expect(buildPercentAreaSegments(percentAreaEdgeCases.missingValue).map(s => s.indices)).toEqual([[0], [2]]); });
  it("accepts single zero parts and rejects invalid totals and values", () => { expect(validatePercentAreaData(percentAreaEdgeCases.zeroSegment).valid).toBe(true); for (const data of [percentAreaEdgeCases.zeroTotal, percentAreaEdgeCases.negative, percentAreaEdgeCases.invalid, percentAreaEdgeCases.duplicate, percentAreaEdgeCases.nonfinite]) expect(validatePercentAreaData(data).valid).toBe(false); });
  it("uses equal spacing and fixed percent scale", () => { expect([0, 1, 2].map(i => mapPercentAreaX(i, 3, [10, 210]))).toEqual([10, 110, 210]); expect(mapPercentAreaY(25, [400, 100])).toBe(325); });
});
