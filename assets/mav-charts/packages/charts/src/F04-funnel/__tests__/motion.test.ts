import { describe, expect, it } from "vitest";
import { getFunnelMotion } from "../motion";

describe("F04 funnel motion", () => {
  it("stages ordinary entry motion", () => { const first = getFunnelMotion("signal", true, 0), second = getFunnelMotion("signal", true, 1); expect(first.enabled).toBe(true); expect(first.initialOpacity).toBe(0); expect(second.delay).toBeGreaterThan(first.delay); });
  it("renders the final first frame when disabled", () => expect(getFunnelMotion("digital", false, 2)).toMatchObject({ enabled: false, duration: 0, delay: 0, initialOpacity: 1 }));
});

