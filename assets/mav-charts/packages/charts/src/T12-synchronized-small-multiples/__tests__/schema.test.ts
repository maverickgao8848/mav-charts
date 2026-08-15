import { describe, expect, it } from "vitest";
import { buildSynchronizedGeometry, getSynchronizedPanelDomain, mapSynchronizedX, validateSynchronizedPanels } from "../schema";
import { synchronizedSmallMultiplesEdgeCases, synchronizedSmallMultiplesExample } from "../example-data";

describe("T12 synchronized geometry", () => {
  it("keeps common labels and independent units/domains", () => {
    const geometry = buildSynchronizedGeometry(synchronizedSmallMultiplesExample);
    expect(geometry.map(({ unit }) => unit)).toEqual(["$M", "%", "pts"]);
    expect(geometry[0].data.map(({ label }) => label)).toEqual(geometry[1].data.map(({ label }) => label));
    expect(geometry[0].domain).not.toEqual(geometry[1].domain);
  });
  it("uses padded extent without forcing unlike panels to a shared zero", () => {
    expect(getSynchronizedPanelDomain(synchronizedSmallMultiplesExample[0])).toEqual([112.7, 176.3]);
    expect(getSynchronizedPanelDomain(synchronizedSmallMultiplesEdgeCases.negative[0])).toEqual([-14.1, 11.1]);
  });
  it("centers constant panels", () => expect(getSynchronizedPanelDomain(synchronizedSmallMultiplesEdgeCases.constant[0])).toEqual([89.1, 108.9]));
  it("retains null independently and finds each panel latest", () => {
    const geometry = buildSynchronizedGeometry(synchronizedSmallMultiplesEdgeCases.missing);
    expect(geometry.map((panel) => panel.data.filter(({ missing }) => missing).map(({ index }) => index))).toEqual([[1], [2], [0]]);
    expect(geometry.every((panel) => panel.data[3].latestValid)).toBe(true);
  });
  it("maps common input indices to equal x intervals", () => expect([0, 1, 2, 3].map((index) => mapSynchronizedX(index, 4, [10, 310]))).toEqual([10, 110, 210, 310]));
  it("requires 2-4 panels with identical ordered labels and finite values", () => {
    expect(validateSynchronizedPanels(synchronizedSmallMultiplesExample).valid).toBe(true);
    for (const invalid of [synchronizedSmallMultiplesEdgeCases.onePanel, synchronizedSmallMultiplesEdgeCases.fivePanels, synchronizedSmallMultiplesEdgeCases.mismatchedLabels, synchronizedSmallMultiplesEdgeCases.duplicatePanel, synchronizedSmallMultiplesEdgeCases.nonfinite]) expect(validateSynchronizedPanels(invalid).valid).toBe(false);
  });
});
