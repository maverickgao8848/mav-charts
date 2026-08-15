import { describe, expect, it } from "vitest";
import { getTimelineItemMotion } from "../motion";

describe("F03 Timeline motion", () => {
  it("provides deterministic staggered interval entry", () => {
    expect(getTimelineItemMotion("signal", true, 0)).toEqual({ animate: true, durationMs: 520, delayMs: 0 });
    expect(getTimelineItemMotion("editorial", true, 2)).toEqual({ animate: true, durationMs: 720, delayMs: 160 });
  });

  it("removes duration and delay when disabled", () => {
    expect(getTimelineItemMotion("digital", false, 3)).toEqual({ animate: false, durationMs: 0, delayMs: 0 });
  });
});

