import { describe, expect, it } from "vitest";
import { getHistogramMotion } from "../motion";
import { resolveHistogramAnimation } from "../index";
describe("D07 motion", () => { it("uses theme entry timing", () => expect(getHistogramMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 620 })); it("honors capture and reduced motion", () => { expect(resolveHistogramAnimation(false, false)).toBe(false); expect(resolveHistogramAnimation(undefined, true)).toBe(false); expect(resolveHistogramAnimation(undefined, false)).toBe(true); }); });
