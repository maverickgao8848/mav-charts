import { describe, expect, it } from "vitest";
import { columnTargetEdgeCases, columnTargetExample } from "../example-data";
import {
  buildColumnTargetGeometry,
  getColumnTargetDomain,
  mapColumnTargetY,
  normalizeColumnTargetRect,
  validateColumnTargetData,
} from "../schema";

describe("B02 column and target geometry", () => {
  it("accepts same-unit actual and target values", () =>
    expect(validateColumnTargetData(columnTargetExample).valid).toBe(true));
  it("accepts independent nulls and signed values", () => {
    for (const data of [
      columnTargetEdgeCases.missingActual,
      columnTargetEdgeCases.missingTarget,
      columnTargetEdgeCases.missingBoth,
      columnTargetEdgeCases.signed,
    ])
      expect(validateColumnTargetData(data).valid).toBe(true);
  });
  it("rejects duplicate/blank labels and nonfinite values", () => {
    for (const data of [
      columnTargetEdgeCases.duplicate,
      columnTargetEdgeCases.nonfiniteActual,
      columnTargetEdgeCases.nonfiniteTarget,
      columnTargetEdgeCases.blank,
    ])
      expect(validateColumnTargetData(data).valid).toBe(false);
  });
  it("uses one positive zero-based domain for actual and targets", () =>
    expect(getColumnTargetDomain(columnTargetExample)).toEqual([
      0, 100.10000000000001,
    ]));
  it("includes zero for signed and negative-only values", () => {
    expect(getColumnTargetDomain(columnTargetEdgeCases.signed)).toEqual([
      -20.4, 14.4,
    ]);
    expect(getColumnTargetDomain(columnTargetEdgeCases.allNegative)).toEqual([
      -22, 0,
    ]);
  });
  it("maps actual and target positions through the same domain", () => {
    expect(mapColumnTargetY(50, [0, 100], [300, 100])).toBe(200);
    expect(mapColumnTargetY(-10, [-20, 20], [300, 100])).toBe(250);
  });
  it("normalizes signed Recharts bars without dropping negative actuals", () => {
    expect(normalizeColumnTargetRect(715, -315)).toEqual({
      y: 400,
      height: 315,
    });
    expect(normalizeColumnTargetRect(250, 150)).toEqual({
      y: 250,
      height: 150,
    });
  });
  it("computes actual-minus-target and first absolute-gap focus", () => {
    const geometry = buildColumnTargetGeometry(columnTargetExample);
    expect(geometry.map(({ delta }) => delta)).toEqual([-12, 2, -6, 11]);
    expect(geometry.map(({ focus }) => focus)).toEqual([
      true,
      false,
      false,
      false,
    ]);
    expect(
      buildColumnTargetGeometry(columnTargetEdgeCases.ties).map(
        ({ focus }) => focus,
      ),
    ).toEqual([true, false, false]);
  });
  it("does not invent delta/focus for missing or equal values", () => {
    expect(
      buildColumnTargetGeometry(columnTargetEdgeCases.missingBoth)[1],
    ).toMatchObject({ delta: null, absoluteDelta: null, focus: false });
    expect(
      buildColumnTargetGeometry(columnTargetEdgeCases.equal).some(
        ({ focus }) => focus,
      ),
    ).toBe(false);
  });
});
