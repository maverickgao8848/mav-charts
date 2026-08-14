import { describe, expect, it } from "vitest";
import {
  multiSeriesLineEdgeCases,
  multiSeriesLineExample,
} from "../example-data";
import {
  buildMultiSeriesLineGeometry,
  buildMultiSeriesLineSegments,
  getMultiSeriesLineDomain,
  mapMultiSeriesLineX,
  mapMultiSeriesLineY,
  validateMultiSeriesLineData,
} from "../schema";

describe("T02 schema and geometry", () => {
  it("validates labels, duplicates and finite values", () => {
    expect(validateMultiSeriesLineData(multiSeriesLineExample).valid).toBe(
      true,
    );
    expect(
      validateMultiSeriesLineData(multiSeriesLineEdgeCases.invalid).valid,
    ).toBe(false);
    expect(
      validateMultiSeriesLineData(multiSeriesLineEdgeCases.duplicate).valid,
    ).toBe(false);
    expect(
      validateMultiSeriesLineData(multiSeriesLineEdgeCases.nonfinite).valid,
    ).toBe(false);
  });
  it("preserves input order and independent missing flags", () => {
    const result = buildMultiSeriesLineGeometry(
      multiSeriesLineEdgeCases.missingPrimary,
    );
    expect(result.map(({ label }) => label)).toEqual([
      "Jan",
      "Feb",
      "Mar",
      "Apr",
    ]);
    expect(
      result.map(({ missingValue, missingComparison }) => [
        missingValue,
        missingComparison,
      ]),
    ).toEqual([
      [false, false],
      [true, false],
      [false, false],
      [false, false],
    ]);
  });
  it("breaks only the affected series", () => {
    expect(
      buildMultiSeriesLineSegments(
        multiSeriesLineEdgeCases.missingPrimary,
        "value",
      ).map(({ indices }) => indices),
    ).toEqual([[0], [2, 3]]);
    expect(
      buildMultiSeriesLineSegments(
        multiSeriesLineEdgeCases.missingPrimary,
        "comparison",
      ).map(({ indices }) => indices),
    ).toEqual([[0, 1, 2, 3]]);
  });
  it("uses a shared padded extent without forcing zero", () => {
    expect(getMultiSeriesLineDomain(multiSeriesLineExample)).toEqual([
      20.7, 60.3,
    ]);
    expect(
      getMultiSeriesLineDomain(multiSeriesLineEdgeCases.negative)[1],
    ).toBeLessThan(0);
    expect(getMultiSeriesLineDomain(multiSeriesLineEdgeCases.constant)).toEqual(
      [6, 8],
    );
    expect(getMultiSeriesLineDomain(multiSeriesLineEdgeCases.extreme)).toEqual([
      -1140000000, 1740000000,
    ]);
  });
  it("maps equal categorical spacing and linear values", () => {
    expect(
      [0, 1, 2, 3].map((index) => mapMultiSeriesLineX(index, 4, [20, 320])),
    ).toEqual([20, 120, 220, 320]);
    expect(mapMultiSeriesLineY(5, [0, 10], [100, 0])).toBe(50);
  });
  it("separates close latest labels", () => {
    const result = buildMultiSeriesLineGeometry([
      { label: "A", value: 10, comparison: 10 },
    ]);
    expect(result[0].valueLabelDy).toBeLessThan(0);
    expect(result[0].comparisonLabelDy).toBeGreaterThan(0);
  });
});
