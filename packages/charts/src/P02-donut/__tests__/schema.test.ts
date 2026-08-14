import { describe, expect, it } from "vitest";
import { donutEdgeCases, donutExample } from "../example-data";
import {
  buildDonutGeometry,
  getDonutAngle,
  validateDonutData,
} from "../schema";
describe("P02 donut geometry", () => {
  it("validates non-negative finite nullable slices", () => {
    expect(validateDonutData(donutExample).valid).toBe(true);
    expect(validateDonutData(donutEdgeCases.missing).valid).toBe(true);
    for (const data of [
      donutEdgeCases.negative,
      donutEdgeCases.duplicate,
      donutEdgeCases.blank,
      donutEdgeCases.nonfinite,
    ])
      expect(validateDonutData(data).valid).toBe(false);
  });
  it("keeps angle proportional to the positive reported total", () => {
    const built = buildDonutGeometry(donutExample);
    expect(built.total).toBe(100);
    expect(built.renderable.map((datum) => datum.share)).toEqual([
      0.73, 0.18, 0.09,
    ]);
    expect(getDonutAngle(18, 100)).toBeCloseTo(64.8);
  });
  it("keeps missing and zero out of angle without losing rows", () => {
    const missing = buildDonutGeometry(donutEdgeCases.missing);
    expect(missing.geometry[1]).toMatchObject({
      missing: true,
      renderable: false,
      share: null,
    });
    const zero = buildDonutGeometry(donutEdgeCases.zero);
    expect(zero.geometry[1]).toMatchObject({
      zero: true,
      renderable: false,
      share: null,
    });
    expect(buildDonutGeometry(donutEdgeCases.allZero)).toMatchObject({
      total: 0,
      renderable: [],
    });
  });
  it("requires a positive reported total", () => {
    expect(validateDonutData(donutEdgeCases.allZero).valid).toBe(false);
  });
});
