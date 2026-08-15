import { describe, expect, it } from "vitest";
import {
  multiSeriesAreaEdgeCases,
  multiSeriesAreaExample,
} from "../example-data";
import {
  buildMultiSeriesAreaGeometry,
  buildMultiSeriesAreaSegments,
  getMultiSeriesAreaDomain,
  mapMultiSeriesAreaX,
  mapMultiSeriesAreaY,
  validateMultiSeriesAreaData,
} from "../schema";
describe("T07 schema and geometry", () => {
  it("validates blank duplicate and non-finite data", () => {
    expect(validateMultiSeriesAreaData(multiSeriesAreaExample).valid).toBe(
      true,
    );
    expect(
      validateMultiSeriesAreaData(multiSeriesAreaEdgeCases.invalid).valid,
    ).toBe(false);
    expect(
      validateMultiSeriesAreaData(multiSeriesAreaEdgeCases.duplicate).valid,
    ).toBe(false);
    expect(
      validateMultiSeriesAreaData(multiSeriesAreaEdgeCases.nonfinite).valid,
    ).toBe(false);
  });
  it("keeps order and independent null flags", () => {
    const result = buildMultiSeriesAreaGeometry(
      multiSeriesAreaEdgeCases.missingPrimary,
    );
    expect(result.map((d) => d.label)).toEqual(["Jan", "Feb", "Mar", "Apr"]);
    expect(result[1]).toMatchObject({
      missingValue: true,
      missingComparison: false,
    });
  });
  it("breaks only the affected area", () => {
    expect(
      buildMultiSeriesAreaSegments(
        multiSeriesAreaEdgeCases.missingPrimary,
        "value",
      ).map((s) => s.indices),
    ).toEqual([[0], [2, 3]]);
    expect(
      buildMultiSeriesAreaSegments(
        multiSeriesAreaEdgeCases.missingPrimary,
        "comparison",
      ).map((s) => s.indices),
    ).toEqual([[0, 1, 2, 3]]);
  });
  it("shares an honest zero-inclusive domain", () => {
    expect(getMultiSeriesAreaDomain(multiSeriesAreaExample)).toEqual([
      0, 80.30000000000001,
    ]);
    expect(getMultiSeriesAreaDomain(multiSeriesAreaEdgeCases.negative)).toEqual(
      [-19.8, 0],
    );
    expect(getMultiSeriesAreaDomain(multiSeriesAreaEdgeCases.mixed)).toEqual([
      -15, 21,
    ]);
    expect(getMultiSeriesAreaDomain(multiSeriesAreaEdgeCases.extreme)).toEqual([
      -1140000000, 1740000000,
    ]);
  });
  it("maps equal spacing and linear y", () => {
    expect(
      [0, 1, 2, 3].map((i) => mapMultiSeriesAreaX(i, 4, [20, 320])),
    ).toEqual([20, 120, 220, 320]);
    expect(mapMultiSeriesAreaY(5, [0, 10], [100, 0])).toBe(50);
  });
  it("separates coincident latest labels", () => {
    const [row] = buildMultiSeriesAreaGeometry([
      { label: "A", value: 10, comparison: 10 },
    ]);
    expect(row.valueLabelDy).toBeLessThan(0);
    expect(row.comparisonLabelDy).toBeGreaterThan(0);
  });
});
