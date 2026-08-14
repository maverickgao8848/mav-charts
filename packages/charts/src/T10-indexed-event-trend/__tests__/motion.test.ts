import { describe, expect, it } from "vitest";
import { getIndexedEventMotion } from "../motion";
describe("T10 motion", () => {
  it("has observable entry and static capture", () => {
    expect(getIndexedEventMotion("signal", true)).toMatchObject({
      isAnimationActive: true,
      animationDuration: 850,
    });
    expect(getIndexedEventMotion("signal", false)).toMatchObject({
      isAnimationActive: false,
      animationDuration: 0,
    });
  });
});
