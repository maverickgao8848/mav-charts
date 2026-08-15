import { describe, expect, it } from "vitest";
import { getHorizontalRankingMotion } from "../motion";

describe("C05 Horizontal Ranking motion", () => {
  it("enables real horizontal entry", () => {
    expect(getHorizontalRankingMotion("signal", true).animationDuration).toBeGreaterThan(0);
    expect(getHorizontalRankingMotion("signal", true).isAnimationActive).toBe(true);
  });

  it("fully disables reduced/capture motion", () => {
    expect(getHorizontalRankingMotion("editorial", false)).toEqual({ isAnimationActive: false, animationDuration: 0, animationEasing: "ease-out" });
  });
});
