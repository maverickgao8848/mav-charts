import { describe, expect, it } from "vitest";
import { roundedColumnEdgeCases, roundedColumnExample } from "../example-data";
import { buildRoundedColumnGeometry, getControlledColumnRadius, getRoundedColumnDomain, validateRoundedColumnData } from "../schema";

describe("C02 Rounded Columns schema and geometry", () => {
  it("preserves null as a gap and focuses the first available value", () => {
    const geometry = buildRoundedColumnGeometry([{ label: "Missing", value: null }, { label: "Ready", value: 4 }]);
    expect(geometry[0]).toMatchObject({ missing: true, focus: false });
    expect(geometry[1]).toMatchObject({ missing: false, focus: true });
    expect(validateRoundedColumnData(roundedColumnEdgeCases.missing).valid).toBe(true);
  });

  it("does not spend the visual focus on a zero-height mark", () => {
    const geometry = buildRoundedColumnGeometry(roundedColumnEdgeCases.smallAndZero);
    expect(geometry[0].focus).toBe(false);
    expect(geometry[1].focus).toBe(true);
  });

  it("anchors positive data at zero and includes zero for signed data", () => {
    expect(getRoundedColumnDomain(roundedColumnExample)[0]).toBe(0);
    expect(getRoundedColumnDomain(roundedColumnExample)[1]).toBeGreaterThan(84);
    const signed = getRoundedColumnDomain(roundedColumnEdgeCases.negative);
    expect(signed[0]).toBeLessThan(-14);
    expect(signed[1]).toBeGreaterThan(9);
  });

  it("caps radius by both half width and half height", () => {
    expect(getControlledColumnRadius(80, 100, 18)).toBe(18);
    expect(getControlledColumnRadius(20, 100, 18)).toBe(10);
    expect(getControlledColumnRadius(80, 6, 18)).toBe(3);
    expect(getControlledColumnRadius(80, 0, 18)).toBe(0);
    expect(getControlledColumnRadius(80, -6, 18)).toBe(3);
    expect(getControlledColumnRadius(80, 6, -2)).toBe(0);
    expect(getControlledColumnRadius(80, 6, Number.NaN)).toBe(0);
  });

  it("supports single, zero, tiny and extreme values without clipping", () => {
    expect(getRoundedColumnDomain(roundedColumnEdgeCases.single)).toEqual([0, 85.12]);
    expect(getRoundedColumnDomain(roundedColumnEdgeCases.smallAndZero)[0]).toBe(0);
    expect(getRoundedColumnDomain(roundedColumnEdgeCases.extreme)[1]).toBeGreaterThan(2_000_000_000);
  });

  it("rejects blank, duplicate and non-finite categories", () => {
    expect(validateRoundedColumnData(roundedColumnEdgeCases.invalid).valid).toBe(false);
    expect(validateRoundedColumnData([{ label: "Same", value: 1 }, { label: "Same", value: 2 }]).errors.join(" ")).toContain("duplicates label");
    expect(validateRoundedColumnData([{ label: "Bad", value: Number.NaN }]).valid).toBe(false);
  });
});
