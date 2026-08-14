import { describe, expect, it } from "vitest";
import { getGroupedColumnMotion } from "../motion";

describe("C03 grouped column motion", () => {
  it("staggers the second series", () => {
    expect(getGroupedColumnMotion("signal", true, 1).animationBegin).toBeGreaterThan(getGroupedColumnMotion("signal", true, 0).animationBegin);
  });
  it("fully disables capture/reduced motion", () => {
    expect(getGroupedColumnMotion("signal", false, 1)).toMatchObject({ isAnimationActive: false, animationBegin: 0, animationDuration: 0 });
  });
});
