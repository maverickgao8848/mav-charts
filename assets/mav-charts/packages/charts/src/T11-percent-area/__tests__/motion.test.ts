import { describe, expect, it } from "vitest";
import { getPercentAreaMotion } from "../motion";
describe("T11 motion", () => { it("supports deterministic entry and capture", () => { expect(getPercentAreaMotion("signal", true, 0)).toMatchObject({ isAnimationActive: true, animationDuration: 700, animationBegin: 0 }); expect(getPercentAreaMotion("signal", false, 1)).toMatchObject({ isAnimationActive: false, animationBegin: 90 }); }); });
