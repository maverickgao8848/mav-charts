import { describe, expect, it } from "vitest";
import { getSankeyMotion } from "../motion";
describe("F02 Sankey motion", () => {
  it("is deterministic and removable", () => {
    expect(getSankeyMotion("signal", true, 2)).toEqual({
      animate: true,
      durationMs: 620,
      delayMs: 90,
    });
    expect(getSankeyMotion("signal", false, 2).animate).toBe(false);
  });
});
