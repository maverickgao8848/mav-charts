import { describe, expect, it } from "vitest";
import { heatmapEdgeCases, heatmapExample } from "../example-data";
import { buildHeatmapGeometry, getHeatmapDomain, normalizeHeatmapValue, validateHeatmapData } from "../schema";

describe("D08 Heatmap schema and geometry", () => {
  it("expands sparse input into a complete row by column grid without inventing zeroes", () => {
    const geometry = buildHeatmapGeometry(heatmapEdgeCases.sparse);
    expect(geometry.rows).toEqual(["Mon", "Tue", "Wed"]);
    expect(geometry.columns).toEqual(["AM", "Noon", "PM"]);
    expect(geometry.cells).toHaveLength(9);
    expect(geometry.cells.filter(({ missing }) => missing === "implicit")).toHaveLength(6);
    expect(geometry.cells.find(({ row, column }) => row === "Mon" && column === "Noon")).toMatchObject({ value: null, normalized: null, missing: "implicit" });
  });

  it("distinguishes explicit null from real zero and duplicate coordinates", () => {
    const missing = buildHeatmapGeometry(heatmapEdgeCases.missing);
    expect(missing.cells.find(({ row, column }) => row === "Mon" && column === "PM")?.missing).toBe("explicit");
    expect(validateHeatmapData(heatmapEdgeCases.missing).valid).toBe(true);
    expect(validateHeatmapData(heatmapEdgeCases.duplicate).errors.join(" ")).toContain("duplicates coordinate");
  });

  it("uses one honest domain for negative, extreme and constant values", () => {
    expect(getHeatmapDomain(heatmapEdgeCases.negative)).toEqual([-18, 14]);
    expect(getHeatmapDomain(heatmapEdgeCases.extreme)).toEqual([-1_000_000, 1_000_000_000]);
    expect(normalizeHeatmapValue(42, [42, 42])).toBe(0.5);
    expect(normalizeHeatmapValue(null, [0, 100])).toBeNull();
    expect(buildHeatmapGeometry(heatmapExample).cells.every(({ normalized }) => normalized === null || normalized >= 0 && normalized <= 1)).toBe(true);
  });

  it("rejects blank categories and non-finite values", () => {
    expect(validateHeatmapData([{ row: "", column: "Q1", value: 2 }]).valid).toBe(false);
    expect(validateHeatmapData([{ row: "North", column: "Q1", value: Number.NaN }]).valid).toBe(false);
  });
});

