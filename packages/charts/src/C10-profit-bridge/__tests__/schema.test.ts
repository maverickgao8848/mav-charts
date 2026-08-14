import { describe, expect, it } from "vitest";
import { profitBridgeEdgeCases, profitBridgeExample } from "../example-data";
import { buildProfitBridgeGeometry, validateProfitBridgeData } from "../schema";

describe("C10 Profit Bridge schema and geometry", () => {
  it("computes honest ranged bars and running totals", () => {
    const geometry = buildProfitBridgeGeometry(profitBridgeExample);
    expect(geometry.map(({ range }) => range)).toEqual([[0, 78], [78, 90], [82, 90], [82, 89], [84, 89], [0, 84]]);
    expect(geometry.map(({ runningTotal }) => runningTotal)).toEqual([78, 90, 82, 89, 84, 84]);
  });

  it("supports a negative closing value without truncating the domain", () => {
    const geometry = buildProfitBridgeGeometry(profitBridgeEdgeCases.negativeClosing);
    expect(geometry.at(-1)?.range).toEqual([-12, 0]);
  });

  it("rejects empty, single and malformed sequences", () => {
    expect(validateProfitBridgeData(profitBridgeEdgeCases.empty).valid).toBe(false);
    expect(validateProfitBridgeData(profitBridgeEdgeCases.single).valid).toBe(false);
    expect(validateProfitBridgeData([{ label: "Bad", value: Number.NaN, kind: "opening" }, { label: "End", value: 1, kind: "closing" }]).valid).toBe(false);
  });

  it("rejects missing values and a dishonest closing total", () => {
    expect(validateProfitBridgeData(profitBridgeEdgeCases.missing).errors.join(" ")).toContain("missing");
    expect(validateProfitBridgeData(profitBridgeEdgeCases.mismatch).errors.join(" ")).toContain("does not equal");
  });
});
