import { describe, expect, it } from "vitest";
import { columnLineEdgeCases, columnLineExample } from "../example-data";
import {
  buildColumnLineGeometry,
  getColumnLineDomains,
  mapColumnLineRateY,
  mapColumnLineScaleY,
  normalizeColumnRect,
  validateColumnLineData,
} from "../schema";

describe("B01 column and percentage line geometry", () => {
  it("accepts the same-category scale and bounded rate contract", () =>
    expect(validateColumnLineData(columnLineExample).valid).toBe(true));
  it("accepts independent null gaps and signed scale values", () => {
    for (const data of [
      columnLineEdgeCases.missingScale,
      columnLineEdgeCases.missingRate,
      columnLineEdgeCases.missingBoth,
      columnLineEdgeCases.negativeScale,
    ])
      expect(validateColumnLineData(data).valid).toBe(true);
  });
  it("rejects out-of-range rates, duplicate/blank labels and nonfinite values", () => {
    for (const data of [
      columnLineEdgeCases.rateBelow,
      columnLineEdgeCases.rateAbove,
      columnLineEdgeCases.duplicate,
      columnLineEdgeCases.nonfiniteScale,
      columnLineEdgeCases.nonfiniteRate,
      columnLineEdgeCases.blank,
    ])
      expect(validateColumnLineData(data).valid).toBe(false);
  });
  it("keeps positive scale zero-based and rate fixed 0..100", () =>
    expect(getColumnLineDomains(columnLineExample)).toEqual({
      scale: [0, 190.3],
      rate: [0, 100],
    }));
  it("includes zero honestly for signed and negative-only scale", () => {
    expect(getColumnLineDomains(columnLineEdgeCases.negativeScale)).toEqual({
      scale: [-20.08, 10.08],
      rate: [0, 100],
    });
    expect(getColumnLineDomains(columnLineEdgeCases.allNegativeScale)).toEqual({
      scale: [-22, 0],
      rate: [0, 100],
    });
  });
  it("maps the independent domains honestly", () => {
    expect(mapColumnLineScaleY(50, [0, 100], [300, 100])).toBe(200);
    expect(mapColumnLineRateY(50, [300, 100])).toBe(200);
    expect(mapColumnLineRateY(100, [300, 100])).toBe(100);
  });
  it("normalizes signed Recharts bars without dropping negative columns", () => {
    expect(normalizeColumnRect(715, -315)).toEqual({ y: 400, height: 315 });
    expect(normalizeColumnRect(250, 150)).toEqual({ y: 250, height: 150 });
  });
  it("marks first peak scale and latest valid rate", () => {
    const geometry = buildColumnLineGeometry([
      { label: "A", scaleValue: 10, ratePercent: 20 },
      { label: "B", scaleValue: 10, ratePercent: null },
      { label: "C", scaleValue: null, ratePercent: 30 },
    ]);
    expect(geometry.map(({ peakScale }) => peakScale)).toEqual([
      true,
      false,
      false,
    ]);
    expect(geometry.map(({ latestRate }) => latestRate)).toEqual([
      false,
      false,
      true,
    ]);
  });
});
