import { describe, expect, it } from "vitest";
import { resolveMotionFrame, resolveMotionPreferences } from "./index";

describe("motion preferences", () => {
  it("disables animation for deterministic captures", () => {
    expect(resolveMotionPreferences("?capture", false).animate).toBe(false);
  });

  it("honors reduced motion", () => {
    expect(resolveMotionPreferences("", true).animate).toBe(false);
  });
});

describe("resolveMotionFrame", () => {
  const spec = { enterMs: 800, holdMs: 1800, exitMs: 300, defaultSceneMs: 2900, minSceneMs: 2200, maxSceneMs: 6000 };
  it("resolves stable phase boundaries", () => {
    expect(resolveMotionFrame(spec, { progress: 0 }).phase).toBe("enter");
    expect(resolveMotionFrame(spec, { progress: 800 / 2900 }).phase).toBe("hold");
    expect(resolveMotionFrame(spec, { progress: 2600 / 2900 }).phase).toBe("exit");
    expect(resolveMotionFrame(spec, { progress: 1 }).phase).toBe("complete");
  });
  it("clamps progress and scales every phase", () => {
    expect(resolveMotionFrame(spec, { durationMs: 5800, progress: 800 / 2900 }).elapsedMs).toBe(1600);
    expect(resolveMotionFrame(spec, { progress: 9 }).sceneProgress).toBe(1);
    expect(resolveMotionFrame(spec, { progress: -2 }).sceneProgress).toBe(0);
  });
});
