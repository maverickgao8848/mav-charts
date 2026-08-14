import { describe, expect, it } from "vitest";
import { resolveMotionPreferences } from "./index";

describe("motion preferences", () => {
  it("disables animation for deterministic captures", () => {
    expect(resolveMotionPreferences("?capture", false).animate).toBe(false);
  });

  it("honors reduced motion", () => {
    expect(resolveMotionPreferences("", true).animate).toBe(false);
  });
});
