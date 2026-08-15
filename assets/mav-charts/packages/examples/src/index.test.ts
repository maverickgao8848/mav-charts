import { describe, expect, it } from "vitest";
import { deterministicTrend, numericEdgeCases } from "./index";

describe("deterministic examples", () => {
  it("stays immutable and stable for screenshots", () => {
    expect(Object.isFrozen(deterministicTrend)).toBe(true);
    expect(deterministicTrend.map(({ value }) => value)).toEqual([42, 47, 45, 56, 63, 68]);
  });

  it("provides the required numeric edge-case fixtures", () => {
    expect(Object.keys(numericEdgeCases)).toEqual(["empty", "single", "signed", "missing", "longLabels", "extreme"]);
  });
});
