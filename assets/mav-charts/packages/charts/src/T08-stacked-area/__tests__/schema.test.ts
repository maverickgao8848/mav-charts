import { describe, expect, it } from "vitest";
import { stackedAreaEdgeCases, stackedAreaExample } from "../example-data";
import {
  buildStackedAreaGeometry,
  buildStackedAreaSegments,
  getStackedAreaDomain,
  mapStackedAreaX,
  mapStackedAreaY,
  validateStackedAreaData,
} from "../schema";
describe("T08 schema and stack geometry", () => {
  it("validates nonnegative finite parts and unique labels", () => {
    expect(validateStackedAreaData(stackedAreaExample).valid).toBe(true);
    expect(
      validateStackedAreaData(stackedAreaEdgeCases.invalidNegative).valid,
    ).toBe(false);
    expect(validateStackedAreaData(stackedAreaEdgeCases.duplicate).valid).toBe(
      false,
    );
    expect(validateStackedAreaData(stackedAreaEdgeCases.nonfinite).valid).toBe(
      false,
    );
  });
  it("calculates raw endpoints without normalization", () => {
    const g = buildStackedAreaGeometry(stackedAreaEdgeCases.arbitrary);
    expect(
      g.map((d) => [
        d.valueStart,
        d.valueEnd,
        d.comparisonStart,
        d.comparisonEnd,
        d.total,
      ]),
    ).toEqual([
      [0, 20, 20, 35, 35],
      [0, 70, 70, 120, 120],
      [0, 5, 5, 13, 13],
    ]);
  });
  it("turns either missing part into a whole gap", () => {
    const g = buildStackedAreaGeometry(stackedAreaEdgeCases.missingValue);
    expect(g[2]).toMatchObject({
      missingWhole: true,
      chartValue: null,
      chartComparison: null,
      total: null,
    });
    expect(
      buildStackedAreaSegments(stackedAreaEdgeCases.missingValue).map(
        (s) => s.indices,
      ),
    ).toEqual([
      [0, 1],
      [3, 4],
    ]);
  });
  it("accepts zero and pads max total", () => {
    expect(validateStackedAreaData(stackedAreaEdgeCases.zero).valid).toBe(true);
    expect(getStackedAreaDomain(stackedAreaExample)).toEqual([
      0, 122.10000000000001,
    ]);
    expect(getStackedAreaDomain(stackedAreaEdgeCases.arbitrary)).toEqual([
      0, 132,
    ]);
  });
  it("maps equal spacing and stack endpoints", () => {
    expect([0, 1, 2].map((i) => mapStackedAreaX(i, 3, [20, 220]))).toEqual([
      20, 120, 220,
    ]);
    expect(mapStackedAreaY(50, [0, 100], [100, 0])).toBe(50);
  });
});
