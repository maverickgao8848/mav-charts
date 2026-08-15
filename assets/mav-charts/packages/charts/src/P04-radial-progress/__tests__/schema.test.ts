import { describe, expect, it } from "vitest";
import { radialProgressEdgeCases, radialProgressExample } from "../example-data";
import { buildRadialProgressGeometry, validateRadialProgressData } from "../schema";

describe("P04 Radial Progress schema and geometry", () => {
  it("maps each percentage to an exact completed and remaining share", () => {
    const geometry = buildRadialProgressGeometry(radialProgressExample);
    expect(geometry[0]).toMatchObject({ value: 78, remainder: 22, index: 0 });
    expect(geometry[2]).toMatchObject({ value: 49, remainder: 51, index: 2 });
  });

  it("accepts the inclusive zero and one-hundred boundaries", () => {
    expect(validateRadialProgressData(radialProgressEdgeCases.extreme).valid).toBe(true);
    expect(buildRadialProgressGeometry(radialProgressEdgeCases.extreme)).toEqual(expect.arrayContaining([
      expect.objectContaining({ value: 0, remainder: 100 }),
      expect.objectContaining({ value: 100, remainder: 0 }),
    ]));
  });

  it("rejects missing, blank, negative, over-100 and non-finite percentages", () => {
    expect(validateRadialProgressData(radialProgressEdgeCases.missing).errors.join(" ")).toContain("missing");
    expect(validateRadialProgressData(radialProgressEdgeCases.invalid).errors.join(" ")).toContain("non-empty label");
    expect(validateRadialProgressData(radialProgressEdgeCases.negative).errors.join(" ")).toContain("between 0 and 100");
    expect(validateRadialProgressData(radialProgressEdgeCases.over100).valid).toBe(false);
    expect(validateRadialProgressData([{ label: "Bad", value: Number.NaN }]).valid).toBe(false);
  });
});

