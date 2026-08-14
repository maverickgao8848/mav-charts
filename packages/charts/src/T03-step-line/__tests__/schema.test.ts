import { describe, expect, it } from "vitest";
import { stepLineEdgeCases, stepLineExample } from "../example-data";
import {
  buildStepAfterPath,
  buildStepAfterPaths,
  buildStepLineGeometry,
  buildStepLineSegments,
  getStepLineDomain,
  mapStepLineX,
  mapStepLineY,
  validateStepLineData,
} from "../schema";
describe("T03 schema and stepAfter geometry", () => {
  it("validates blank, duplicate and non-finite values", () => {
    expect(validateStepLineData(stepLineExample).valid).toBe(true);
    expect(validateStepLineData(stepLineEdgeCases.invalid).valid).toBe(false);
    expect(validateStepLineData(stepLineEdgeCases.duplicate).valid).toBe(false);
    expect(validateStepLineData(stepLineEdgeCases.nonfinite).valid).toBe(false);
  });
  it("preserves order, gaps and latest valid", () => {
    const result = buildStepLineGeometry(stepLineEdgeCases.trailingGap);
    expect(result.map(({ label }) => label)).toEqual([
      "Reported",
      "Latest report",
      "Pending",
    ]);
    expect(result.map(({ missing }) => missing)).toEqual([false, false, true]);
    expect(result.map(({ latestValid }) => latestValid)).toEqual([
      false,
      true,
      false,
    ]);
  });
  it("splits null gaps instead of bridging", () => {
    expect(
      buildStepLineSegments(stepLineEdgeCases.missing).map(
        ({ indices }) => indices,
      ),
    ).toEqual([[0], [2, 3]]);
  });
  it("uses a padded finite extent without forcing zero", () => {
    expect(getStepLineDomain(stepLineExample)).toEqual([12.5, 78.5]);
    expect(getStepLineDomain(stepLineEdgeCases.negative)[1]).toBeLessThan(0);
    expect(getStepLineDomain(stepLineEdgeCases.constant)).toEqual([6, 8]);
    expect(getStepLineDomain(stepLineEdgeCases.extreme)[1]).toBeCloseTo(
      1_650_000_000,
      0,
    );
  });
  it("maps equal category spacing and linear y values", () => {
    expect(
      [0, 1, 2, 3].map((index) => mapStepLineX(index, 4, [20, 320])),
    ).toEqual([20, 120, 220, 320]);
    expect(mapStepLineY(5, [0, 10], [100, 0])).toBe(50);
  });
  it("constructs true stepAfter horizontal holds followed by vertical jumps", () => {
    const path = buildStepAfterPath([
      { index: 0, value: 10, x: 0, y: 80 },
      { index: 1, value: 20, x: 50, y: 40 },
      { index: 2, value: 15, x: 100, y: 60 },
    ]);
    expect(path).toBe("M0 80 H50 V40 H100 V60");
    expect(buildStepAfterPaths(stepLineExample, [0, 300], [100, 0])[0]).toMatch(
      /^M0 .+ H100 V.+ H200 V.+ H300 V/,
    );
  });
});
