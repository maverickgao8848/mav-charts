import { describe, expect, it } from "vitest";
import { scatterEdgeCases, scatterExample } from "../example-data";
import {
  buildScatterGeometry,
  getScatterDomain,
  mapScatterX,
  mapScatterY,
  validateScatterData,
} from "../schema";
describe("D01 schema", () => {
  it("validates finite nullable unique coordinates", () => {
    expect(validateScatterData(scatterExample).valid).toBe(true);
    expect(validateScatterData(scatterEdgeCases.invalid).valid).toBe(false);
    expect(validateScatterData(scatterEdgeCases.duplicate).valid).toBe(false);
    expect(validateScatterData(scatterEdgeCases.nonfinite).valid).toBe(false);
  });
  it("uses independent honest padded domains", () => {
    expect(getScatterDomain(scatterEdgeCases.negative, "value")).toEqual([
      -23.4, 17.4,
    ]);
    expect(getScatterDomain(scatterEdgeCases.constant, "value")).toEqual([
      6, 8,
    ]);
    expect(getScatterDomain(scatterEdgeCases.constant, "comparison")).toEqual([
      8, 10,
    ]);
  });
  it("omits missing points and focuses first complete", () => {
    const g = buildScatterGeometry(scatterEdgeCases.missing);
    expect(g.map((d) => [d.missing, d.focus])).toEqual([
      [false, true],
      [true, false],
      [true, false],
      [false, false],
    ]);
  });
  it("keeps overlapping coordinates while offsetting only labels", () => {
    const g = buildScatterGeometry(scatterEdgeCases.overlap);
    expect(new Set(g.map((d) => `${d.value},${d.comparison}`)).size).toBe(1);
    expect(new Set(g.map((d) => `${d.labelDx},${d.labelDy}`)).size).toBe(3);
  });
  it("anchors labels inward near the top and right plot edges", () => {
    const geometry = buildScatterGeometry(scatterExample);
    expect(geometry[2].labelDy).toBe(17);
    expect(geometry[3].labelDx).toBe(-12);
  });
  it("maps coordinates linearly", () => {
    expect(mapScatterX(5, [0, 10], [20, 220])).toBe(120);
    expect(mapScatterY(5, [0, 10], [100, 0])).toBe(50);
  });
});
