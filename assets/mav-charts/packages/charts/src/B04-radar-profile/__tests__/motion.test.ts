import { describe, expect, it } from "vitest";
import { getRadarProfileMotion } from "../motion";
describe("B04 motion", () => {
  it("supports staggered and static Radar entry", () => {
    expect(getRadarProfileMotion("signal", true, 120)).toMatchObject({
      isAnimationActive: true,
      animationBegin: 120,
    });
    expect(getRadarProfileMotion("digital", false)).toMatchObject({
      isAnimationActive: false,
      animationBegin: 0,
    });
  });
});
