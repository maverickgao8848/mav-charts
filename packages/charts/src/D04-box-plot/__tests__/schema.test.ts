import { describe, expect, it } from "vitest";
import { buildBoxPlotGeometry, getBoxPlotDomain, getBoxPlotWidth, getBoxPlotX, mapBoxPlotY, validateBoxPlotData } from "../schema";
import { boxPlotEdgeCases, boxPlotExample } from "../example-data";
describe("D04 box plot geometry", () => {
  it("validates ordered finite five-number summaries and external outliers", () => { expect(validateBoxPlotData(boxPlotExample).valid).toBe(true); expect(validateBoxPlotData(boxPlotEdgeCases.invalidOrder).valid).toBe(false); expect(validateBoxPlotData(boxPlotEdgeCases.invalidOutlier).valid).toBe(false); expect(validateBoxPlotData(boxPlotEdgeCases.nonfinite).valid).toBe(false); });
  it("requires whole-category null rather than partial missing summaries", () => { expect(validateBoxPlotData(boxPlotEdgeCases.missing).valid).toBe(true); expect(validateBoxPlotData(boxPlotEdgeCases.partialMissing).valid).toBe(false); });
  it("accepts negative and zero-IQR summaries", () => { expect(validateBoxPlotData(boxPlotEdgeCases.negative).valid).toBe(true); expect(validateBoxPlotData(boxPlotEdgeCases.constant).valid).toBe(true); });
  it("uses whiskers and outliers in a padded domain without forcing zero", () => { const normal = getBoxPlotDomain(boxPlotExample), negative = getBoxPlotDomain(boxPlotEdgeCases.negative); expect(normal[0]).toBeCloseTo(2.9, 8); expect(normal[1]).toBeCloseTo(76.1, 8); expect(negative[0]).toBeCloseTo(-62.2, 8); expect(negative[1]).toBeCloseTo(24.2, 8); });
  it("centers a fully constant distribution", () => expect(getBoxPlotDomain([boxPlotEdgeCases.constant[0]])).toEqual([6, 8]));
  it("maps every statistic linearly and bounds category box width", () => { expect(mapBoxPlotY(50, [0, 100], [380, 40])).toBe(210); expect([0, 1, 2].map((index) => getBoxPlotX(index, 3, [60, 960]))).toEqual([210, 510, 810]); expect(getBoxPlotWidth(2, 800)).toBe(72); expect(getBoxPlotWidth(10, 800)).toBe(30.4); });
  it("focuses the first nonmissing category and rejects duplicate labels", () => { expect(buildBoxPlotGeometry(boxPlotEdgeCases.missing).map(({ focus }) => focus)).toEqual([false, true]); expect(validateBoxPlotData(boxPlotEdgeCases.duplicate).valid).toBe(false); });
});
