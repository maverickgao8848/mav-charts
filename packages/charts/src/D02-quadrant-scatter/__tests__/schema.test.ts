import { describe, expect, it } from "vitest";
import {
  quadrantScatterEdgeCases,
  quadrantScatterExample,
  quadrantScatterThresholds,
} from "../example-data";
import {
  buildQuadrantScatterGeometry,
  classifyQuadrant,
  getQuadrantScatterDomains,
  mapQuadrantScatterX,
  mapQuadrantScatterY,
  validateQuadrantScatterData,
  validateQuadrantScatterThresholds,
} from "../schema";
describe("D02 quadrant scatter geometry", () => {
  it("classifies all quadrants and boundaries explicitly", () => {
    expect(classifyQuadrant(70, 70, quadrantScatterThresholds)).toBe(
      "upper-right",
    );
    expect(classifyQuadrant(30, 70, quadrantScatterThresholds)).toBe(
      "upper-left",
    );
    expect(classifyQuadrant(30, 30, quadrantScatterThresholds)).toBe(
      "lower-left",
    );
    expect(classifyQuadrant(70, 30, quadrantScatterThresholds)).toBe(
      "lower-right",
    );
    expect(classifyQuadrant(50, 70, quadrantScatterThresholds)).toBe(
      "boundary",
    );
    expect(classifyQuadrant(70, 50, quadrantScatterThresholds)).toBe(
      "boundary",
    );
  });
  it("omits null whole points while preserving real coordinates", () => {
    const g = buildQuadrantScatterGeometry(
      quadrantScatterEdgeCases.missing,
      quadrantScatterThresholds,
    );
    expect(g).toHaveLength(1);
    expect(g[0]).toMatchObject({ label: "Complete", x: 62, y: 71 });
  });
  it("includes points and thresholds in padded domains without forcing zero", () => {
    const d = getQuadrantScatterDomains(
      quadrantScatterExample,
      quadrantScatterThresholds,
    );
    expect(d.x[0]).toBeLessThan(31);
    expect(d.x[1]).toBeGreaterThan(72);
    expect(d.y[0]).toBeLessThan(24);
    expect(d.y[1]).toBeGreaterThan(81);
    const positive = getQuadrantScatterDomains(
      [{ label: "A", x: 100, y: 200 }],
      { x: 120, y: 240 },
    );
    expect(positive.x[0]).toBeGreaterThan(0);
    expect(positive.y[0]).toBeGreaterThan(0);
  });
  it("moves labels rather than true points for overlaps", () => {
    const g = buildQuadrantScatterGeometry(
      quadrantScatterEdgeCases.overlap,
      quadrantScatterThresholds,
    );
    expect(g[0].x).toBe(68);
    expect(g[3].x).toBe(68);
    expect(
      new Set(g.map((d) => `${d.labelDx},${d.labelDy}`)).size,
    ).toBeGreaterThan(1);
  });
  it("validates labels, coordinates and thresholds", () => {
    expect(validateQuadrantScatterData(quadrantScatterExample).valid).toBe(
      true,
    );
    expect(
      validateQuadrantScatterData(quadrantScatterEdgeCases.missing).valid,
    ).toBe(true);
    for (const data of [
      quadrantScatterEdgeCases.invalid,
      quadrantScatterEdgeCases.duplicate,
      quadrantScatterEdgeCases.nonfinite,
    ])
      expect(validateQuadrantScatterData(data).valid).toBe(false);
    expect(validateQuadrantScatterThresholds({ x: Infinity, y: 2 }).valid).toBe(
      false,
    );
  });
  it("maps linear positions", () => {
    expect(mapQuadrantScatterX(50, [0, 100], [10, 210])).toBe(110);
    expect(mapQuadrantScatterY(25, [0, 100], [400, 100])).toBe(325);
  });
});
