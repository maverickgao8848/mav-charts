import { describe, expect, it } from "vitest";
import { getTreemapMotion } from "../motion";
describe("F01 motion", () => { it("supports animated and static first frames", () => { expect(getTreemapMotion("signal", true).isAnimationActive).toBe(true); expect(getTreemapMotion("digital", false).isAnimationActive).toBe(false); }); });
