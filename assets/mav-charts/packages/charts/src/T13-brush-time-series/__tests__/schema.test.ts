import { describe, expect, it } from "vitest";
import { brushTimeSeriesEdgeCases, brushTimeSeriesExample } from "../example-data";
import { buildBrushTimeSeriesGeometry, getBrushTimeSeriesDomain, validateBrushTimeSeriesData } from "../schema";

describe("T13 Brush Time Series schema and geometry", () => {
  it("preserves ordered values and assigns stable indices", () => {
    const geometry = buildBrushTimeSeriesGeometry(brushTimeSeriesExample);
    expect(geometry[0]).toMatchObject({ label: "00:00", value: 42, index: 0 });
    expect(geometry.at(-1)).toMatchObject({ label: "23:00", value: 121, index: 23 });
  });

  it("supports negative and extreme domains without truncation", () => {
    expect(getBrushTimeSeriesDomain(brushTimeSeriesEdgeCases.signed)[0]).toBeLessThan(0);
    expect(getBrushTimeSeriesDomain(brushTimeSeriesEdgeCases.extreme)[1]).toBeGreaterThan(1_000_000);
  });

  it("rejects missing, blank-label and non-finite observations", () => {
    expect(validateBrushTimeSeriesData(brushTimeSeriesEdgeCases.missing).errors.join(" ")).toContain("missing");
    expect(validateBrushTimeSeriesData(brushTimeSeriesEdgeCases.invalid).errors.join(" ")).toContain("non-empty label");
    expect(validateBrushTimeSeriesData([{ label: "Bad", value: Number.NaN }]).valid).toBe(false);
  });
});

