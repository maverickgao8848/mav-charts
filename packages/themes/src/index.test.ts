import { describe, expect, it } from "vitest";
import { getVisualSystem, visualSystemIds, visualSystems } from "./index";

describe("visual systems", () => {
  it("exposes exactly the three approved systems", () => {
    expect(visualSystemIds).toEqual(["signal", "editorial", "digital"]);
  });

  it.each(visualSystemIds)("defines complete tokens for %s", (id) => {
    const theme = getVisualSystem(id);
    expect(theme.key).toBe(id);
    expect(theme.tags).toHaveLength(3);
    expect(theme.primary).toMatch(/^#[0-9a-f]{6}$/i);
    expect(theme.line.hairline).toBeGreaterThan(0);
  });

  it("keeps the systems as distinct authored directions", () => {
    expect(new Set(Object.values(visualSystems).map((theme) => theme.display)).size).toBe(3);
  });
});
