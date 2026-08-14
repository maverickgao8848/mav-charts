import { describe, expect, it } from "vitest";
import { getSynchronizedSmallMultiplesMotion } from "../motion";
import { resolveSynchronizedAnimation } from "../index";
describe("T12 motion", () => {
  it("stages panels", () => expect(getSynchronizedSmallMultiplesMotion("signal", true, 2)).toMatchObject({ isAnimationActive: true, animationBegin: 140 }));
  it("honors explicit capture and reduced preference", () => { expect(resolveSynchronizedAnimation(false, false)).toBe(false); expect(resolveSynchronizedAnimation(undefined, true)).toBe(false); expect(resolveSynchronizedAnimation(undefined, false)).toBe(true); });
});
