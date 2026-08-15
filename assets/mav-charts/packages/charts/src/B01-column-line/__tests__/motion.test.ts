import { describe, expect, it } from "vitest";
import { getColumnLineMotion } from "../motion";

describe("B01 motion", () => {
  it("enables Recharts and real SVG entry motion", () => {
    const motion = getColumnLineMotion("signal", true, 2);
    expect(motion.bar.isAnimationActive).toBe(true);
    expect(motion.line.isAnimationActive).toBe(true);
    expect(motion.entry.enabled).toBe(true);
    expect(motion.entry.delay).toBeGreaterThan(0);
  });
  it("renders the final first frame when disabled", () =>
    expect(getColumnLineMotion("digital", false, 2)).toMatchObject({
      bar: { isAnimationActive: false, animationDuration: 0 },
      line: { isAnimationActive: false, animationDuration: 0 },
      entry: { enabled: false, duration: 0, delay: 0, initialOpacity: 1 },
    }));
});
