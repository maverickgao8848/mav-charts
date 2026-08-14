import { describe, expect, it } from "vitest";
import { dualAxisEdgeCases, dualAxisExample } from "../example-data";
import { buildDualAxisGeometry, getDualAxisDomains, validateDualAxisData } from "../schema";

describe("B03 Dual Axis schema and geometry", () => {
  it("preserves nullable gaps instead of converting them to zero", () => {
    expect(buildDualAxisGeometry(dualAxisEdgeCases.missingBar)[1]).toMatchObject({ barValue: null, lineValue: 31, index: 1 });
    expect(buildDualAxisGeometry(dualAxisEdgeCases.missingLine)[1]).toMatchObject({ barValue: 44, lineValue: null, index: 1 });
    expect(validateDualAxisData(dualAxisEdgeCases.missingBar).valid).toBe(true);
  });

  it("uses independent honest domains and anchors applicable bar scales at zero", () => {
    const domains = getDualAxisDomains(dualAxisExample);
    expect(domains.bar[0]).toBe(0);
    expect(domains.bar[1]).toBeGreaterThan(71);
    expect(domains.line[0]).toBeGreaterThan(0);
    expect(domains.line[0]).toBeLessThan(29);
    expect(domains.line[1]).toBeGreaterThan(36);
  });

  it("includes zero for signed bars while keeping flat line domains visible", () => {
    const signed = getDualAxisDomains(dualAxisEdgeCases.negative);
    expect(signed.bar[0]).toBeLessThan(-18);
    expect(signed.bar[1]).toBeGreaterThan(14);
    const flat = getDualAxisDomains(dualAxisEdgeCases.flat);
    expect(flat.bar).toEqual([0, 46.2]);
    expect(flat.line[0]).toBeLessThan(18);
    expect(flat.line[1]).toBeGreaterThan(18);
  });

  it("rejects duplicate, blank and non-finite data", () => {
    expect(validateDualAxisData(dualAxisEdgeCases.invalid).errors.join(" ")).toContain("duplicates label");
    expect(validateDualAxisData(dualAxisEdgeCases.nonfinite).errors.join(" ")).toContain("non-finite");
    expect(validateDualAxisData([{ label: "", barValue: 2, lineValue: 3 }]).valid).toBe(false);
  });
});

