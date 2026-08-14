import { describe, expect, it } from "vitest";
import { getErrorBarMotion } from "../motion";
describe("D06 motion", () => {
  it("supports deterministic entry and capture", () => {
    expect(getErrorBarMotion("signal", true)).toMatchObject({
      isAnimationActive: true,
      animationDuration: 650,
    });
    expect(getErrorBarMotion("digital", false)).toMatchObject({
      isAnimationActive: false,
      animationDuration: 960,
    });
  });
});
