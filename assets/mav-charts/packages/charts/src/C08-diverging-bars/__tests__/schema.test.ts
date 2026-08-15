import { describe, expect, it } from "vitest";
import { divergingBarEdgeCases, divergingBarExample } from "../example-data";
import { buildDivergingBarGeometry, getDivergingBarDomain, getDivergingBarLength, mapDivergingBarX, validateDivergingBarData } from "../schema";

describe("C08 Diverging Bars schema and geometry", () => {
  it("preserves input order, null gaps and only the first reported focus", () => {
    const geometry = buildDivergingBarGeometry(divergingBarExample);
    expect(geometry.map(({ label, index }) => [label, index])).toEqual([["North America", 0], ["Europe", 1], ["Asia Pacific", 2], ["Latin America", 3]]);
    expect(geometry.map(({ focus }) => focus)).toEqual([true, false, false, false]);
    expect(buildDivergingBarGeometry(divergingBarEdgeCases.missing)[1]).toMatchObject({ missing: true, value: null });
    expect(buildDivergingBarGeometry(divergingBarEdgeCases.leadingNull).map(({ focus }) => focus)).toEqual([false, true, false]);
  });

  it("uses a shared unbroken domain containing zero", () => {
    const mixed = getDivergingBarDomain(divergingBarExample);
    expect(mixed[0]).toBeLessThan(-18); expect(mixed[1]).toBeGreaterThan(35);
    expect(getDivergingBarDomain(divergingBarEdgeCases.allPositive)[0]).toBe(0);
    expect(getDivergingBarDomain(divergingBarEdgeCases.allNegative)[1]).toBe(0);
    expect(getDivergingBarDomain([{ label: "Missing", value: null }])).toEqual([-1, 1]);
  });

  it("maps sign and length honestly around the same zero", () => {
    const domain = [-30, 40] as const, range = [100, 800] as const;
    expect(mapDivergingBarX(0, domain, range)).toBe(400);
    expect(mapDivergingBarX(-20, domain, range)).toBeLessThan(400);
    expect(mapDivergingBarX(20, domain, range)).toBeGreaterThan(400);
    expect(getDivergingBarLength(-20, domain, range)).toBe(getDivergingBarLength(20, domain, range));
  });

  it("retains zero and extreme finite values", () => {
    expect(buildDivergingBarGeometry(divergingBarEdgeCases.zero)[0].value).toBe(0);
    expect(getDivergingBarDomain(divergingBarEdgeCases.extreme)[1]).toBeGreaterThan(2_000_000_000);
  });

  it("rejects blank, duplicate and non-finite rows", () => {
    expect(validateDivergingBarData(divergingBarEdgeCases.invalid).valid).toBe(false);
    expect(validateDivergingBarData([{ label: "A", value: 1 }, { label: "A", value: 2 }]).valid).toBe(false);
    expect(validateDivergingBarData([{ label: "Bad", value: Number.NaN }]).valid).toBe(false);
  });
});
