import { describe, expect, it } from "vitest";
import { dumbbellEdgeCases, dumbbellExample } from "../example-data";
import { buildDumbbellGeometry, getDumbbellDomain, validateDumbbellData } from "../schema";

describe("C11 Dumbbell schema and geometry", () => {
  it("encodes values on one shared linear scale", () => {
    const geometry = buildDumbbellGeometry(dumbbellExample);
    expect(geometry[0].afterX).toBeGreaterThan(geometry[0].beforeX);
    expect(geometry[2].afterX).toBeLessThan(geometry[2].beforeX);
    expect(geometry.map(({ delta }) => delta)).toEqual([26, 16, -3, 27, 8]);
  });

  it("supports equal, signed and extreme values", () => {
    expect(buildDumbbellGeometry(dumbbellEdgeCases.flat)[0].direction).toBe("flat");
    expect(getDumbbellDomain(dumbbellEdgeCases.signed)[0]).toBeLessThan(0);
    expect(buildDumbbellGeometry(dumbbellEdgeCases.extreme)[0].afterX).toBeGreaterThan(buildDumbbellGeometry(dumbbellEdgeCases.extreme)[0].beforeX);
  });

  it("rejects missing labels and non-finite values", () => {
    expect(validateDumbbellData([{ label: "", before: 1, after: Number.NaN }]).valid).toBe(false);
    expect(validateDumbbellData(dumbbellEdgeCases.missing).errors.join(" ")).toContain("missing");
  });
});
