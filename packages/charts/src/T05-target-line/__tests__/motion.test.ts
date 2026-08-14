import { describe, expect, it } from "vitest";
import { resolveTargetLineAnimation } from "../index";
import { getTargetLineMotion } from "../motion";
describe("T05 motion", () => { it("uses system duration", () => expect(getTargetLineMotion("signal", true)).toMatchObject({ isAnimationActive: true, animationDuration: 700 })); it("resolves capture and reduced motion", () => { expect(resolveTargetLineAnimation(false, false)).toBe(false); expect(resolveTargetLineAnimation(undefined, true)).toBe(false); expect(resolveTargetLineAnimation(undefined, false)).toBe(true); }); });
