import { describe, expect, it } from "vitest";
import { rangeAreaEdgeCases, rangeAreaExample } from "../example-data";
import { buildRangeAreaGeometry, getRangeAreaDomain, validateRangeAreaData } from "../schema";

describe("T09 Range Area schema and geometry", () => {
  it("encodes low/high as an interval and preserves the median", () => {
    const geometry = buildRangeAreaGeometry(rangeAreaExample);
    expect(geometry[0]).toMatchObject({ range: [34, 52], median: 43, spread: 18 });
    expect(geometry.at(-1)).toMatchObject({ range: [55, 82], median: 72, spread: 27 });
  });

  it("supports negative and extreme domains without truncation", () => {
    expect(getRangeAreaDomain(rangeAreaEdgeCases.signed)[0]).toBeLessThan(0);
    expect(getRangeAreaDomain(rangeAreaEdgeCases.extreme)[1]).toBeGreaterThanOrEqual(1_000_000);
  });

  it("rejects missing, inverted and non-finite intervals", () => {
    expect(validateRangeAreaData(rangeAreaEdgeCases.missing).errors.join(" ")).toContain("missing");
    expect(validateRangeAreaData(rangeAreaEdgeCases.inverted).errors.join(" ")).toContain("low ≤ median ≤ high");
    expect(validateRangeAreaData([{ label: "Bad", low: 1, median: 2, high: Number.NaN }]).valid).toBe(false);
  });
});
