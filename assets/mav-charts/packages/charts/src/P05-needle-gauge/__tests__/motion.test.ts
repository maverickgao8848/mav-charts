import { describe, expect, it } from "vitest";
import { getNeedleGaugeMotion } from "../motion";

describe("P05 needle gauge motion", () => {
  it("exposes observable needle entry motion", () => { const motion = getNeedleGaugeMotion("signal", true); expect(motion.enabled).toBe(true); expect(motion.duration).toBeGreaterThan(0); });
  it("is static for capture or reduced motion", () => expect(getNeedleGaugeMotion("signal", false)).toMatchObject({ enabled: false, duration: 0 }));
});

