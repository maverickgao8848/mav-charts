import { describe, expect, it } from "vitest";
import { errorBarEdgeCases, errorBarExample } from "../example-data";
import {
  buildErrorBarGeometry,
  getErrorBarDomain,
  getErrorBarXDomain,
  mapErrorBarX,
  mapErrorBarY,
  validateErrorBarData,
} from "../schema";
describe("D06 error bar geometry", () => {
  it("retains absolute bounds and derives asymmetric distances", () => {
    expect(buildErrorBarGeometry(errorBarExample)[0]).toMatchObject({
      estimate: 72,
      lower: 61,
      upper: 84,
      lowerError: 11,
      upperError: 12,
      errors: [11, 12],
      focused: true,
    });
  });
  it("omits fully missing marks but treats them as valid input", () => {
    expect(validateErrorBarData(errorBarEdgeCases.missing).valid).toBe(true);
    const g = buildErrorBarGeometry(errorBarEdgeCases.missing);
    expect(g.map((d) => d.label)).toEqual(["Reported", "Latest"]);
    expect(g.map((d) => d.index)).toEqual([0, 2]);
  });
  it("accepts negative, asymmetric, and zero-error bounds", () => {
    for (const data of [
      errorBarEdgeCases.negative,
      errorBarEdgeCases.asymmetric,
      errorBarEdgeCases.zeroError,
    ])
      expect(validateErrorBarData(data).valid).toBe(true);
    expect(
      buildErrorBarGeometry(errorBarEdgeCases.zeroError)[0].errors,
    ).toEqual([0, 0]);
  });
  it("rejects partial, inverted, blank, duplicate, and nonfinite data", () => {
    for (const data of [
      errorBarEdgeCases.partialMissing,
      errorBarEdgeCases.invalidOrder,
      errorBarEdgeCases.invalid,
      errorBarEdgeCases.duplicate,
      errorBarEdgeCases.nonfinite,
    ])
      expect(validateErrorBarData(data).valid).toBe(false);
  });
  it("uses padded bound domains without forcing zero and centers constants", () => {
    expect(getErrorBarDomain(errorBarExample)).toEqual([25.7, 89.3]);
    const negative = getErrorBarDomain(errorBarEdgeCases.negative);
    expect(negative[1]).toBeLessThan(5);
    const exact = getErrorBarDomain([
      { label: "A", estimate: 10, lower: 10, upper: 10 },
    ]);
    expect(exact).toEqual([9, 11]);
  });
  it("maps positions and preserves missing categorical slots", () => {
    expect(getErrorBarXDomain(3)).toEqual([-0.25, 2.25]);
    expect(mapErrorBarX(1, [-0.25, 2.25], [0, 250])).toBe(125);
    expect(mapErrorBarY(50, [0, 100], [400, 100])).toBe(250);
  });
});
