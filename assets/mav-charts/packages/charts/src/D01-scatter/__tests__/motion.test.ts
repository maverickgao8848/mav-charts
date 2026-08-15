import { describe, expect, it } from "vitest";
import { getScatterMotion } from "../motion";
describe("D01 motion", () => {
  it("supports observable and capture states", () => {
    expect(getScatterMotion("signal", true).animationDuration).toBe(750);
    expect(getScatterMotion("signal", false).isAnimationActive).toBe(false);
  });
});
