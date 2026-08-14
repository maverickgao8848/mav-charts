import { describe, expect, it } from "vitest";
import { getDivergingBarMotion } from "../motion";

describe("C08 Diverging Bars motion", () => {
  it("enables real entry motion", () => { expect(getDivergingBarMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 620, animationEasing: "ease-out" }); });
  it("disables motion deterministically", () => { expect(getDivergingBarMotion("digital", false)).toMatchObject({ isAnimationActive: false, animationEasing: "ease-out" }); });
});
