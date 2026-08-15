import { describe, expect, it } from "vitest";
import { simpleColumnEdgeCases, simpleColumnExample } from "../example-data";
import { buildSimpleColumnGeometry, getSimpleColumnDomain, validateSimpleColumnData } from "../schema";

describe("C01 Simple Columns schema and geometry", () => {
  it("preserves null as a missing gap instead of zero", () => {
    expect(buildSimpleColumnGeometry(simpleColumnEdgeCases.missing)[1]).toMatchObject({ label: "West", value: null, missing: true, index: 1 });
    expect(validateSimpleColumnData(simpleColumnEdgeCases.missing).valid).toBe(true);
  });

  it("anchors positive bars at zero and includes zero for signed values", () => {
    expect(getSimpleColumnDomain(simpleColumnExample)[0]).toBe(0);
    expect(getSimpleColumnDomain(simpleColumnExample)[1]).toBeGreaterThan(72);
    const signed = getSimpleColumnDomain(simpleColumnEdgeCases.negative);
    expect(signed[0]).toBeLessThan(-18);
    expect(signed[1]).toBeGreaterThan(14);
  });

  it("supports single and extreme values without clipping the domain", () => {
    expect(getSimpleColumnDomain(simpleColumnEdgeCases.single)).toEqual([0, 46.2]);
    expect(getSimpleColumnDomain(simpleColumnEdgeCases.extreme)[1]).toBeGreaterThan(1_000_000_000);
  });

  it("rejects duplicate, blank and non-finite categories", () => {
    expect(validateSimpleColumnData(simpleColumnEdgeCases.invalid).errors.join(" ")).toContain("duplicates label");
    expect(validateSimpleColumnData([{ label: "", value: 2 }]).valid).toBe(false);
    expect(validateSimpleColumnData([{ label: "Bad", value: Number.NaN }]).valid).toBe(false);
  });
});

