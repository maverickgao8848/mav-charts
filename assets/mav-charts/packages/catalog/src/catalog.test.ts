import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { prototypeCatalog } from "./catalog";

describe("prototype catalog", () => {
  it("contains registered templates with unique ids and slugs", () => {
    expect(prototypeCatalog).toHaveLength(48);
    expect(new Set(prototypeCatalog.map(({ id }) => id)).size).toBe(48);
    expect(new Set(prototypeCatalog.map(({ slug }) => slug)).size).toBe(48);
  });

  it("maps every item to all three visual systems and a source path", () => {
    for (const item of prototypeCatalog) {
      expect(item.visualSystems).toEqual(["signal", "editorial", "digital"]);
      expect(item.githubPath).toMatch(/^packages\/charts\/src\/.+\.tsx$/);
    }
  });

  it("requires bilingual product descriptions", () => {
    for (const item of prototypeCatalog) {
      expect(item.nameZh.length).toBeGreaterThan(1);
      expect(item.descriptionZh.length).toBeGreaterThan(5);
    }
  });

  it("only permits stable status when the source path exists", () => {
    const stable = prototypeCatalog.filter(({ status }) => status === "stable");
    expect(stable.map(({ id }) => id)).toEqual([
      "C01",
      "C02",
      "C03",
      "C04",
      "C05",
      "C06",
      "C07",
      "C08",
      "C09",
      "T01",
      "C10",
      "C11",
      "T09",
      "T13",
      "P02",
      "P04",
      "D03",
      "D08",
      "F03",
      "B03",
      "T02",
      "T03",
      "T04",
      "T05",
      "T06",
      "T07",
      "T08",
      "T10",
      "T11",
      "T12",
      "D01",
      "D02",
      "D04",
      "D06",
      "D05",
      "D07",
      "F01",
      "F04",
      "F05",
      "F02",
      "B01",
      "F06",
      "B02",
      "P05",
      "P01",
      "P03",
      "B04",
      "B05",
    ]);
    for (const item of stable)
      expect(existsSync(resolve(process.cwd(), item.githubPath))).toBe(true);
  });
});
