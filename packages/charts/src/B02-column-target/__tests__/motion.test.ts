import { describe, expect, it } from "vitest";
import { getColumnTargetMotion } from "../motion";

describe("B02 motion", () => {
  it("enables Recharts bars and staggered marker entry", () => {
    const motion = getColumnTargetMotion("signal", true, 2);
    expect(motion.bar.isAnimationActive).toBe(true);
    expect(motion.marker.enabled).toBe(true);
    expect(motion.marker.delay).toBeGreaterThan(0);
  });
  it("renders final first frame when disabled", () =>
    expect(getColumnTargetMotion("digital", false, 2)).toMatchObject({
      bar: { isAnimationActive: false, animationDuration: 0 },
      marker: { enabled: false, duration: 0, delay: 0, initialOpacity: 1 },
    }));
});
