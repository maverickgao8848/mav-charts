import { describe, expect, it } from "vitest";
import { getDualAxisMotion } from "../motion";

describe("B03 Dual Axis motion", () => {
  it("provides distinct observable motion for both series", () => {
    const motion = getDualAxisMotion("editorial", true);
    expect(motion.bar).toMatchObject({ isAnimationActive: true, animationDuration: 720 });
    expect(motion.line).toMatchObject({ isAnimationActive: true, animationDuration: 880 });
  });

  it("uses deterministic static frames for both series", () => {
    const motion = getDualAxisMotion("digital", false);
    expect(motion.bar).toMatchObject({ isAnimationActive: false, animationDuration: 0 });
    expect(motion.line).toMatchObject({ isAnimationActive: false, animationDuration: 0 });
  });
});

