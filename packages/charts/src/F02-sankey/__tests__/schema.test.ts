import { describe, expect, it } from "vitest";
import {
  buildSankeyGeometry,
  formatSankeyLabel,
  formatSankeyValue,
  validateSankeyData,
} from "../schema";
import { sankeyEdgeCases, sankeyExample } from "../example-data";

describe("F02 Sankey schema", () => {
  it("preserves first-seen node and input link order", () => {
    const geometry = buildSankeyGeometry(sankeyExample);
    expect(geometry.nodes.map((node) => node.name)).toEqual([
      "Inputs",
      "Production",
      "Brand",
      "Platform",
      "Channel",
      "Loss",
      "Customers",
    ]);
    expect(geometry.links[0]).toMatchObject({
      source: 0,
      target: 1,
      value: 82,
      focused: true,
    });
  });
  it("omits null links without converting them to zero", () => {
    const geometry = buildSankeyGeometry(sankeyEdgeCases.missing);
    expect(geometry.links).toHaveLength(2);
    expect(geometry.links.some((link) => link.targetName === "Pending")).toBe(
      false,
    );
  });
  it("rejects invalid, zero, blank, self, duplicate, cycle and nonfinite input", () => {
    for (const key of [
      "invalid",
      "zero",
      "blank",
      "self",
      "duplicate",
      "cycle",
      "nonfinite",
    ] as const)
      expect(validateSankeyData(sankeyEdgeCases[key]).valid, key).toBe(false);
  });
  it("allows split, merge, deep and extreme positive flows", () => {
    for (const key of ["split", "merge", "deep", "extreme"] as const)
      expect(validateSankeyData(sankeyEdgeCases[key]).valid, key).toBe(true);
  });
  it("formats compact values and display-only labels", () => {
    expect(formatSankeyValue(1_800_000_000)).toBe("1.8B");
    expect(formatSankeyLabel("Independent distribution", 12)).toBe(
      "Independent…",
    );
  });
});
