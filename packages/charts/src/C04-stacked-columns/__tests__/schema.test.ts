import { describe, expect, it } from "vitest";
import { stackedColumnEdgeCases, stackedColumnExample } from "../example-data";
import { buildStackedColumnGeometry, getStackedColumnDomain, validateStackedColumnData } from "../schema";

describe("C04 Stacked Columns schema and geometry", () => {
  it("computes contiguous positive segment starts, ends and totals", () => {
    const first = buildStackedColumnGeometry(stackedColumnExample)[0];
    expect(first).toMatchObject({ valueStart: 0, valueEnd: 64, comparisonStart: 64, comparisonEnd: 100, positiveTotal: 100, negativeTotal: 0, total: 100, complete: true });
  });

  it("accumulates positive and negative segments independently from zero", () => {
    const [north, , south] = buildStackedColumnGeometry(stackedColumnEdgeCases.negative);
    expect(north).toMatchObject({ valueStart: 0, valueEnd: -14, comparisonStart: -14, comparisonEnd: -22, positiveTotal: 0, negativeTotal: -22 });
    expect(south).toMatchObject({ valueStart: 0, valueEnd: -4, comparisonStart: 0, comparisonEnd: 7, positiveTotal: 7, negativeTotal: -4, total: 3 });
    const domain = getStackedColumnDomain(stackedColumnEdgeCases.negative);
    expect(domain[0]).toBeLessThan(-22);
    expect(domain[1]).toBeGreaterThan(14);
  });

  it("preserves missing segments and refuses to invent a total", () => {
    const missingBase = buildStackedColumnGeometry(stackedColumnEdgeCases.missingValue)[0];
    const missingUpper = buildStackedColumnGeometry(stackedColumnEdgeCases.missingComparison)[0];
    expect(missingBase).toMatchObject({ missingValue: true, comparisonStart: 0, comparisonEnd: 36, total: null, complete: false });
    expect(missingUpper).toMatchObject({ missingComparison: true, valueStart: 0, valueEnd: 64, total: null, complete: false });
  });

  it("anchors positive stacks at zero and contains extreme totals", () => {
    expect(getStackedColumnDomain(stackedColumnExample)).toEqual([0, 112.00000000000001]);
    expect(getStackedColumnDomain(stackedColumnEdgeCases.extreme)[1]).toBeGreaterThan(2_000_000_000);
    expect(getStackedColumnDomain(stackedColumnEdgeCases.flatZero)[0]).toBe(0);
  });

  it("preserves arbitrary totals instead of normalizing them to 100", () => {
    const [datum] = buildStackedColumnGeometry([{ label: "Actual magnitude", value: 20, comparison: 10 }]);
    expect(datum).toMatchObject({ valueEnd: 20, comparisonStart: 20, comparisonEnd: 30, total: 30, positiveTotal: 30 });
    expect(getStackedColumnDomain([{ label: "Actual magnitude", value: 20, comparison: 10 }])[1]).toBeCloseTo(33.6);
  });

  it("rejects blank, duplicate and non-finite data", () => {
    expect(validateStackedColumnData(stackedColumnEdgeCases.invalid).valid).toBe(false);
    expect(validateStackedColumnData([{ label: "A", value: 1, comparison: 2 }, { label: "A", value: 3, comparison: 4 }]).errors.join(" ")).toContain("duplicates label");
    expect(validateStackedColumnData([{ label: "Bad", value: Number.NaN, comparison: 2 }]).valid).toBe(false);
  });
});
