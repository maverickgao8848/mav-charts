import { describe, expect, it } from "vitest";
import { labelledDonutEdgeCases, labelledDonutExample } from "../example-data";
import { buildLabelledDonutGeometry, getLabelledDonutAngle, layoutLabelledDonutLabels, validateLabelledDonutData } from "../schema";

describe("P03 labelled donut geometry", () => {
  it("validates unique finite non-negative slices", () => {
    expect(validateLabelledDonutData(labelledDonutExample).valid).toBe(true);
    for (const data of [labelledDonutEdgeCases.negative, labelledDonutEdgeCases.duplicate, labelledDonutEdgeCases.nonfinite, labelledDonutEdgeCases.blank]) expect(validateLabelledDonutData(data).valid).toBe(false);
  });
  it("maps reported positive values to exact angles", () => {
    const built = buildLabelledDonutGeometry(labelledDonutExample);
    expect(built.total).toBe(100);
    expect(built.renderable.map((datum) => datum.endAngle - datum.startAngle)).toEqual([expect.closeTo(183.6), expect.closeTo(104.4), expect.closeTo(72)]);
    expect(getLabelledDonutAngle(25, 100)).toBe(90);
  });
  it("keeps missing and zero without sectors or shares", () => {
    const missing = buildLabelledDonutGeometry(labelledDonutEdgeCases.missing), zero = buildLabelledDonutGeometry(labelledDonutEdgeCases.zero);
    expect(missing.geometry[1]).toMatchObject({ missing: true, renderable: false, share: null });
    expect(zero.geometry[1]).toMatchObject({ zero: true, renderable: false, share: null });
  });
  it("chooses the first largest reported slice as focus", () => {
    const equal = buildLabelledDonutGeometry(labelledDonutEdgeCases.equal);
    expect(equal.geometry.map((datum) => datum.focus)).toEqual([true, false, false, false]);
  });
  it("collision-adjusts labels without changing slice angles", () => {
    const built = buildLabelledDonutGeometry(labelledDonutEdgeCases.many), before = built.renderable.map((datum) => datum.endAngle - datum.startAngle), positions = layoutLabelledDonutLabels(built.geometry);
    for (const side of ["left", "right"] as const) {
      const y = positions.filter((position) => position.side === side).map((position) => position.y).sort((a, b) => a - b);
      for (let index = 1; index < y.length; index++) expect(y[index] - y[index - 1]).toBeGreaterThanOrEqual(0.419);
    }
    expect(built.renderable.map((datum) => datum.endAngle - datum.startAngle)).toEqual(before);
  });
});
