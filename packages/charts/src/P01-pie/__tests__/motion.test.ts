import { describe, expect, it } from "vitest";
import { getPieMotion } from "../motion";

describe("P01 pie motion", () => {
  it("exposes observable entry motion", () => { const motion = getPieMotion("signal", true, 2); expect(motion.enabled).toBe(true); expect(motion.initialOpacity).toBe(0); expect(motion.duration).toBeGreaterThan(0); expect(motion.delay).toBeGreaterThan(0); });
  it("is static for capture or reduced motion", () => expect(getPieMotion("signal", false, 2)).toMatchObject({ enabled: false, initialOpacity: 1, duration: 0, delay: 0 }));
});

