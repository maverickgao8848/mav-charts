import { describe, expect, it } from "vitest";
import { horizontalRankingEdgeCases, horizontalRankingExample } from "../example-data";
import { buildHorizontalRankingGeometry, getHorizontalRankingDomain, getHorizontalRankingLength, mapHorizontalRankingX, validateHorizontalRankingData } from "../schema";

describe("C05 Horizontal Ranking schema and geometry", () => {
  it("sorts finite values descending and keeps missing rows at the bottom", () => {
    const geometry = buildHorizontalRankingGeometry([{ label: "Low", value: 2 }, { label: "Missing", value: null }, { label: "High", value: 9 }]);
    expect(geometry.map(({ label }) => label)).toEqual(["High", "Low", "Missing"]);
    expect(geometry.map(({ rank }) => rank)).toEqual([1, 2, null]);
    expect(geometry[2]).toMatchObject({ missing: true, originalIndex: 1 });
  });

  it("uses stable competition ranks for ties with one visual focus", () => {
    const geometry = buildHorizontalRankingGeometry(horizontalRankingEdgeCases.ties);
    expect(geometry.map(({ label }) => label)).toEqual(["First tied input", "Second tied input", "Third place", "Fourth input"]);
    expect(geometry.map(({ rank }) => rank)).toEqual([1, 1, 3, 4]);
    expect(geometry.map(({ focus }) => focus)).toEqual([true, false, false, false]);
  });

  it("uses an honest zero-based or signed domain", () => {
    expect(getHorizontalRankingDomain(horizontalRankingExample)[0]).toBe(0);
    expect(getHorizontalRankingDomain(horizontalRankingExample)[1]).toBeGreaterThan(173);
    const signed = getHorizontalRankingDomain(horizontalRankingEdgeCases.negative);
    expect(signed[0]).toBeLessThan(-28);
    expect(signed[1]).toBeGreaterThan(18);
  });

  it("maps bar length from the shared zero baseline", () => {
    const domain = [-20, 30] as const;
    expect(mapHorizontalRankingX(0, domain, 500)).toBe(200);
    expect(getHorizontalRankingLength(30, domain, 500)).toBe(300);
    expect(getHorizontalRankingLength(-20, domain, 500)).toBe(200);
  });

  it("supports single/extreme data and rejects blank, duplicate, non-finite rows", () => {
    expect(buildHorizontalRankingGeometry(horizontalRankingEdgeCases.single)[0].rank).toBe(1);
    expect(getHorizontalRankingDomain(horizontalRankingEdgeCases.extreme)[1]).toBeGreaterThan(2_000_000_000);
    expect(validateHorizontalRankingData(horizontalRankingEdgeCases.invalid).valid).toBe(false);
    expect(validateHorizontalRankingData([{ label: "A", value: 1 }, { label: "A", value: 2 }]).valid).toBe(false);
  });
});
