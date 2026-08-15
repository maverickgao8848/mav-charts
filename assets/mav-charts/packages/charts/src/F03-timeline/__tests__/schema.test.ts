import { describe, expect, it } from "vitest";
import { timelineEdgeCases, timelineExample } from "../example-data";
import { buildTimelineGeometry, getTimelineDomain, mapTimelineX, validateTimelineData } from "../schema";

describe("F03 Timeline schema and geometry", () => {
  it("keeps interval lengths strictly proportional on one linear scale", () => {
    const domain = [0, 10] as const;
    const range = [50, 550] as const;
    expect(mapTimelineX(10, domain, range) - mapTimelineX(0, domain, range)).toBe(500);
    expect(mapTimelineX(4, domain, range) - mapTimelineX(2, domain, range)).toBe(100);
    expect(buildTimelineGeometry(timelineExample).items[0].duration).toBeCloseTo(0.8);
  });

  it("assigns true overlapping intervals to separate lanes without moving endpoints", () => {
    const geometry = buildTimelineGeometry(timelineEdgeCases.overlap);
    expect(geometry.laneCount).toBe(4);
    expect(geometry.items.map(({ lane }) => lane)).toEqual([0, 1, 2, 3]);
    expect(geometry.items[1]).toMatchObject({ start: 1, end: 7 });
  });

  it("supports negative, zero-duration and extreme time domains", () => {
    expect(getTimelineDomain(timelineEdgeCases.negative)[0]).toBeLessThan(-18);
    expect(buildTimelineGeometry(timelineEdgeCases.zeroDuration).items[0].duration).toBe(0);
    expect(getTimelineDomain(timelineEdgeCases.extreme)[1]).toBeGreaterThan(1_000_000_000);
  });

  it("rejects missing, inverted, blank and non-finite intervals", () => {
    expect(validateTimelineData(timelineEdgeCases.missing).errors.join(" ")).toContain("missing");
    expect(validateTimelineData(timelineEdgeCases.inverted).errors.join(" ")).toContain("greater than or equal");
    expect(validateTimelineData([{ label: "", start: 0, end: 2 }]).valid).toBe(false);
    expect(validateTimelineData([{ label: "Bad", start: 0, end: Number.NaN }]).valid).toBe(false);
  });
});

