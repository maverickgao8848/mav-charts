import { describe, expect, it } from "vitest";
import { parsePreviewOptions } from "./previewBridge";

describe("preview route", () => {
  it("parses deterministic frame inputs", () => {
    expect(parsePreviewOptions("?durationMs=4200&progress=0.42&autoplay=0")).toEqual({ durationMs: 4200, progress: 0.42, autoplay: false, capture: false });
  });
  it("clamps progress and keeps capture compatibility", () => {
    expect(parsePreviewOptions("?progress=4&capture").progress).toBe(1);
    expect(parsePreviewOptions("?progress=4&capture").capture).toBe(true);
  });
});
