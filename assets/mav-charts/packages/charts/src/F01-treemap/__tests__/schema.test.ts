import { describe, expect, it } from "vitest";
import { treemapEdgeCases, treemapExample } from "../example-data";
import { buildTreemapGeometry, getTreemapArea, validateTreemapData } from "../schema";

describe("F01 treemap geometry", () => {
  it("validates unique finite non-negative values", () => {
    expect(validateTreemapData(treemapExample).valid).toBe(true);
    for (const data of [treemapEdgeCases.negative, treemapEdgeCases.invalid, treemapEdgeCases.duplicate, treemapEdgeCases.nonfinite, treemapEdgeCases.blankParent]) expect(validateTreemapData(data).valid).toBe(false);
  });
  it("uses an honest positive total and deterministic focus", () => {
    const geometry = buildTreemapGeometry(treemapExample);
    expect(geometry.total).toBe(100);
    expect(geometry.tiles.map((tile) => tile.share)).toEqual([.34, .24, .16, .11, .15]);
    expect(geometry.tiles.map((tile) => tile.focus)).toEqual([true, false, false, false, false]);
  });
  it("keeps missing and zero without assigning area", () => {
    const geometry = buildTreemapGeometry(treemapEdgeCases.missing);
    expect(geometry.total).toBe(60);
    expect(geometry.tiles.map((tile) => tile.renderable)).toEqual([true, false, true]);
    expect(geometry.tiles[1].missing).toBe(true);
    expect(buildTreemapGeometry(treemapEdgeCases.zero).tiles[1].zero).toBe(true);
  });
  it("maps magnitude to area linearly", () => {
    expect(getTreemapArea(25, 100, 40_000)).toBe(10_000);
    expect(getTreemapArea(50, 100, 40_000)).toBe(20_000);
    expect(getTreemapArea(0, 100, 40_000)).toBe(0);
  });
});

