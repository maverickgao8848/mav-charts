import { describe, expect, it } from "vitest";
import { buildGroupedBarGeometry, getGroupedBarDomain, getGroupedBarLength, getGroupedBarSlots, mapGroupedBarX, validateGroupedBarData } from "../schema";
import { groupedBarEdgeCases, groupedBarExample } from "../example-data";

describe("C06 grouped bar schema and geometry", () => {
  it("preserves input category order and assigns only the first primary focus", () => {
    const geometry = buildGroupedBarGeometry(groupedBarExample);
    expect(geometry.map(({ label }) => label)).toEqual(["North America", "Europe", "Asia Pacific"]);
    expect(geometry.map(({ focus }) => focus)).toEqual([true, false, false]);
  });
  it("keeps independent null gaps", () => {
    expect(buildGroupedBarGeometry(groupedBarEdgeCases.missingPrimary)[1]).toMatchObject({ missingValue: true, missingComparison: false, value: null, comparison: 46 });
    expect(buildGroupedBarGeometry(groupedBarEdgeCases.missingComparison)[0]).toMatchObject({ missingValue: false, missingComparison: true, comparison: null });
  });
  it("uses a shared honest domain", () => {
    expect(getGroupedBarDomain(groupedBarExample)[0]).toBe(0);
    const signed = getGroupedBarDomain(groupedBarEdgeCases.negative);
    expect(signed[0]).toBeLessThan(0);
    expect(signed[1]).toBeGreaterThan(0);
    expect(getGroupedBarDomain(groupedBarEdgeCases.flat)).toEqual([0, 1]);
  });
  it("calculates non-overlapping pair slots", () => {
    const slots = getGroupedBarSlots(60, 2, 0.1);
    expect(slots.barHeight).toBe(27);
    expect(slots.gap).toBe(6);
    expect(slots.offsets).toEqual([0, 33]);
    expect(slots.offsets[0] + slots.barHeight).toBeLessThanOrEqual(slots.offsets[1]);
    expect(slots.offsets[1] + slots.barHeight).toBeLessThanOrEqual(slots.groupHeight);
  });
  it("maps signed lengths from the same zero baseline", () => {
    const domain = [-40, 80] as const;
    const range = [100, 700] as const;
    expect(mapGroupedBarX(0, domain, range)).toBe(300);
    expect(getGroupedBarLength(-20, domain, range)).toBe(100);
    expect(getGroupedBarLength(40, domain, range)).toBe(200);
  });
  it("rejects blank, duplicate and non-finite values", () => {
    expect(validateGroupedBarData(groupedBarExample).valid).toBe(true);
    expect(validateGroupedBarData(groupedBarEdgeCases.invalid).valid).toBe(false);
    expect(validateGroupedBarData([{ label: "A", value: 1, comparison: 2 }, { label: "A", value: 2, comparison: 3 }]).valid).toBe(false);
  });
});
