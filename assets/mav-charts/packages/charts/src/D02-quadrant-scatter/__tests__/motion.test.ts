import { describe, expect, it } from "vitest";
import { getQuadrantScatterMotion } from "../motion";
describe("D02 motion", () => {
  it("supports deterministic entry and capture", () => {
    expect(getQuadrantScatterMotion("signal", true)).toMatchObject({
      isAnimationActive: true,
      animationDuration: 650,
    });
    expect(getQuadrantScatterMotion("digital", false)).toMatchObject({
      isAnimationActive: false,
      animationDuration: 960,
    });
  });
});
