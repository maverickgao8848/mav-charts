import { describe, expect, it } from "vitest";
import { radarProfileEdgeCases, radarProfileExample } from "../example-data";
import {
  buildRadarProfileGeometry,
  mapRadarPoint,
  mapRadarRadius,
  validateRadarProfileData,
} from "../schema";
describe("B04 radar geometry", () => {
  it("enforces unique normalized axes", () => {
    expect(validateRadarProfileData(radarProfileExample).valid).toBe(true);
    for (const data of [
      radarProfileEdgeCases.negative,
      radarProfileEdgeCases.over100,
      radarProfileEdgeCases.invalid,
      radarProfileEdgeCases.duplicate,
      radarProfileEdgeCases.nonfinite,
    ])
      expect(validateRadarProfileData(data).valid).toBe(false);
  });
  it("uses one fixed 0..100 radial scale", () => {
    expect(mapRadarRadius(0, 200)).toBe(0);
    expect(mapRadarRadius(50, 200)).toBe(100);
    expect(mapRadarRadius(100, 200)).toBe(200);
  });
  it("maps polar points without changing score", () => {
    expect(mapRadarPoint(50, 0, 100)).toEqual([
      expect.closeTo(0),
      expect.closeTo(-50),
    ]);
    expect(mapRadarPoint(100, 90, 100)).toEqual([
      expect.closeTo(100),
      expect.closeTo(0),
    ]);
  });
  it("keeps missing independent and identifies peaks", () => {
    const built = buildRadarProfileGeometry(
      radarProfileEdgeCases.missingPrimary,
      100,
    );
    expect(built.geometry[1].primaryPoint).toBeNull();
    expect(built.geometry[1].comparisonPoint).not.toBeNull();
    expect(built.primaryPeak?.label).toBe("A");
    expect(built.comparisonPeak?.label).toBe("B");
  });
  it("requires three reported axes per profile polygon", () => {
    const one = buildRadarProfileGeometry(radarProfileEdgeCases.single);
    expect(one.primaryComplete).toBe(false);
    expect(one.comparisonComplete).toBe(false);
    expect(buildRadarProfileGeometry(radarProfileExample).primaryComplete).toBe(
      true,
    );
  });
});
