import { describe, expect, it } from "vitest";
import { buildGroupedColumnGeometry, getGroupedColumnDomain, getGroupedColumnSlots, validateGroupedColumnData } from "../schema";
import { groupedColumnEdgeCases, groupedColumnExample } from "../example-data";

describe("C03 grouped column schema and geometry", () => {
  it("validates labels and finite nullable series", () => {
    expect(validateGroupedColumnData(groupedColumnExample).valid).toBe(true);
    expect(validateGroupedColumnData(groupedColumnEdgeCases.missingPrimary).valid).toBe(true);
    expect(validateGroupedColumnData(groupedColumnEdgeCases.invalid).valid).toBe(false);
    expect(validateGroupedColumnData([{ label: "A", value: 1, comparison: 2 }, { label: "A", value: 3, comparison: 4 }]).valid).toBe(false);
  });

  it("keeps each missing series independent", () => {
    const primary = buildGroupedColumnGeometry(groupedColumnEdgeCases.missingPrimary);
    const comparison = buildGroupedColumnGeometry(groupedColumnEdgeCases.missingComparison);
    expect(primary[0]).toMatchObject({ missingValue: true, missingComparison: false });
    expect(comparison[0]).toMatchObject({ missingValue: false, missingComparison: true });
  });

  it("uses one honest domain for both series", () => {
    expect(getGroupedColumnDomain(groupedColumnExample)[0]).toBe(0);
    const signed = getGroupedColumnDomain(groupedColumnEdgeCases.negative);
    expect(signed[0]).toBeLessThan(0);
    expect(signed[1]).toBeGreaterThan(0);
    expect(getGroupedColumnDomain([{ label: "A", value: null, comparison: null }])).toEqual([0, 1]);
  });

  it("packs side-by-side slots without overlap or overflow", () => {
    const slots = getGroupedColumnSlots(100, 2, 0.1);
    expect(slots.offsets).toEqual([0, 55]);
    expect(slots.barWidth).toBe(45);
    expect(slots.offsets[0] + slots.barWidth).toBeLessThanOrEqual(slots.offsets[1]);
    expect(slots.offsets[1] + slots.barWidth).toBeLessThanOrEqual(slots.groupWidth);
  });
});
