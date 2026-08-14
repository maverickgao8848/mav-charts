import { describe, expect, it } from "vitest";
import { bubbleQuadrantEdgeCases, bubbleQuadrantExample } from "../example-data";
import { buildBubbleQuadrantGeometry, getBubbleQuadrantDomains, validateBubbleQuadrantData } from "../schema";

describe("D03 Bubble Quadrant schema and geometry", () => {
  it("uses square-root radius so bubble area is proportional to size", () => {
    const geometry = buildBubbleQuadrantGeometry([
      { label: "Small", x: 10, y: 10, size: 25 },
      { label: "Large", x: 20, y: 20, size: 100 },
    ], { x: 0, y: 0 }, 40);
    expect(geometry[0].radius).toBe(20);
    expect(geometry[1].radius).toBe(40);
    expect((geometry[1].radius ** 2) / (geometry[0].radius ** 2)).toBe(4);
    expect(buildBubbleQuadrantGeometry(bubbleQuadrantEdgeCases.zeroSize)[0].radius).toBe(0);
  });

  it("assigns explicit quadrants and preserves negative and extreme domains", () => {
    expect(buildBubbleQuadrantGeometry(bubbleQuadrantExample)[0].quadrant).toBe("leaders");
    expect(buildBubbleQuadrantGeometry(bubbleQuadrantExample)[2].quadrant).toBe("challengers");
    expect(getBubbleQuadrantDomains(bubbleQuadrantEdgeCases.negative).x[0]).toBeLessThan(0);
    expect(getBubbleQuadrantDomains(bubbleQuadrantEdgeCases.extreme).x[1]).toBeGreaterThan(2_000_000);
  });

  it("keeps true overlap coordinates while staggering direct labels", () => {
    const geometry = buildBubbleQuadrantGeometry(bubbleQuadrantEdgeCases.overlap);
    expect(new Set(geometry.slice(0, 3).map(({ labelDx, labelDy }) => `${labelDx}:${labelDy}`)).size).toBe(3);
    expect(geometry[0]).toMatchObject({ x: 68, y: 72 });
    expect(geometry[1]).toMatchObject({ x: 69, y: 71 });
  });

  it("rejects missing, blank, negative-size and non-finite data", () => {
    expect(validateBubbleQuadrantData(bubbleQuadrantEdgeCases.missing).errors.join(" ")).toContain("missing");
    expect(validateBubbleQuadrantData(bubbleQuadrantEdgeCases.invalid).errors.join(" ")).toContain("non-negative");
    expect(validateBubbleQuadrantData([{ label: "Bad", x: Number.NaN, y: 2, size: 4 }]).valid).toBe(false);
  });
});
