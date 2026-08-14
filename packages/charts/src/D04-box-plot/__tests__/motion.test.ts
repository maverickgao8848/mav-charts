import { describe, expect, it } from "vitest";
import { getBoxPlotMotion } from "../motion";
import { resolveBoxPlotAnimation } from "../index";
describe("D04 motion", () => { it("stages category entry", () => expect(getBoxPlotMotion("signal", true, 2)).toEqual({ enabled: true, duration: 640, delay: 130, initialOpacity: 0 })); it("honors capture and reduced motion", () => { expect(resolveBoxPlotAnimation(false, false)).toBe(false); expect(resolveBoxPlotAnimation(undefined, true)).toBe(false); expect(resolveBoxPlotAnimation(undefined, false)).toBe(true); }); });
