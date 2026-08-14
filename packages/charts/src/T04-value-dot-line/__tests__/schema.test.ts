import { describe, expect, it } from "vitest";
import { valueDotLineEdgeCases, valueDotLineExample } from "../example-data";
import {
  buildValueDotLineGeometry,
  buildValueDotLineSegments,
  getValueDotLineDomain,
  mapValueDotLineX,
  mapValueDotLineY,
  validateValueDotLineData,
} from "../schema";

describe("T04 value dot line schema and geometry", () => {
  it("validates blanks, duplicates and non-finite values", () => {
    expect(validateValueDotLineData(valueDotLineExample).valid).toBe(true);
    expect(validateValueDotLineData(valueDotLineEdgeCases.invalid).valid).toBe(false);
    expect(validateValueDotLineData(valueDotLineEdgeCases.duplicate).valid).toBe(false);
    expect(validateValueDotLineData(valueDotLineEdgeCases.nonfinite).valid).toBe(false);
  });

  it("preserves input order and marks missing observations", () => {
    const result = buildValueDotLineGeometry(valueDotLineEdgeCases.trailingGap);
    expect(result.map(({ label }) => label)).toEqual(["Reported", "Latest report", "Pending"]);
    expect(result.map(({ missing }) => missing)).toEqual([false, false, true]);
  });

  it("splits internal, leading and trailing null gaps instead of bridging", () => {
    expect(buildValueDotLineSegments(valueDotLineEdgeCases.missing).map(({ indices }) => indices)).toEqual([[0], [2, 3]]);
    expect(buildValueDotLineSegments(valueDotLineEdgeCases.leadingGap)[0]?.startIndex).toBe(1);
    expect(buildValueDotLineSegments(valueDotLineEdgeCases.trailingGap)[0]?.endIndex).toBe(1);
  });

  it("uses a padded finite extent without forcing zero", () => {
    expect(getValueDotLineDomain(valueDotLineExample)).toEqual([121.7, 179.3]);
    expect(getValueDotLineDomain(valueDotLineEdgeCases.negative)[1]).toBeLessThan(0);
    expect(getValueDotLineDomain(valueDotLineEdgeCases.constant)).toEqual([6, 8]);
  });

  it("maps equal input indices to equal x intervals and values honestly", () => {
    expect([0, 1, 2, 3].map((index) => mapValueDotLineX(index, 4, [10, 310]))).toEqual([10, 110, 210, 310]);
    expect(mapValueDotLineY(50, [0, 100], [300, 100])).toBe(200);
  });

  it("alternates near-value label lanes and anchors edge labels inward", () => {
    const result = buildValueDotLineGeometry(valueDotLineEdgeCases.nearCollision);
    expect(result.map(({ labelLane }) => labelLane)).toEqual([-1, -1, 1, -1, 1]);
    expect(result[0].labelAnchor).toBe("start");
    expect(result.at(-1)?.labelAnchor).toBe("end");
  });
});
