import { describe, expect, it } from "vitest";
import {
  buildTrendLineGeometry,
  buildTrendLineSegments,
  getTrendLineDomain,
  mapTrendLineX,
  mapTrendLineY,
  validateTrendLineData,
} from "../schema";
import { trendLineEdgeCases, trendLineExample } from "../example-data";

describe("T01 trend geometry", () => {
  it("preserves input order and marks the latest finite observation", () => {
    const geometry = buildTrendLineGeometry(trendLineEdgeCases.trailingGap);
    expect(geometry.map(({ label }) => label)).toEqual(["Reported", "Latest report", "Pending"]);
    expect(geometry.map(({ latestValid }) => latestValid)).toEqual([false, true, false]);
  });

  it("breaks paths at internal, leading and trailing nulls", () => {
    expect(buildTrendLineSegments(trendLineEdgeCases.missing)).toEqual([
      { startIndex: 0, endIndex: 0, indices: [0] },
      { startIndex: 2, endIndex: 3, indices: [2, 3] },
    ]);
    expect(buildTrendLineSegments(trendLineEdgeCases.leadingGap)[0]?.startIndex).toBe(1);
    expect(buildTrendLineSegments(trendLineEdgeCases.trailingGap)[0]?.endIndex).toBe(1);
  });

  it("uses padded finite extent without forcing zero", () => {
    expect(getTrendLineDomain(trendLineExample)).toEqual([25.1, 59.9]);
    expect(getTrendLineDomain(trendLineEdgeCases.negative)).toEqual([-19.3, -3.7]);
  });

  it("centers constant values in a nonzero span", () => {
    expect(getTrendLineDomain(trendLineEdgeCases.constant)).toEqual([6, 8]);
  });

  it("maps equal input indices to equal x intervals and values honestly", () => {
    expect([0, 1, 2, 3].map((index) => mapTrendLineX(index, 4, [10, 310]))).toEqual([10, 110, 210, 310]);
    expect(mapTrendLineY(50, [0, 100], [300, 100])).toBe(200);
  });

  it("accepts null and signed values but rejects blank, duplicate and nonfinite rows", () => {
    expect(validateTrendLineData(trendLineEdgeCases.missing).valid).toBe(true);
    expect(validateTrendLineData(trendLineEdgeCases.negative).valid).toBe(true);
    expect(validateTrendLineData(trendLineEdgeCases.invalid).valid).toBe(false);
    expect(validateTrendLineData(trendLineEdgeCases.duplicate).valid).toBe(false);
  });
});
