import { describe, expect, it } from "vitest";
import { indexedEventEdgeCases, indexedEventExample } from "../example-data";
import {
  buildIndexedEventGeometry,
  buildIndexedEventSegments,
  getIndexedEventDomain,
  getIndexedEventMarkers,
  mapIndexedEventX,
  mapIndexedEventY,
  validateIndexedEventData,
} from "../schema";
describe("T10 schema and geometry", () => {
  it("validates labels, finite values, duplicates, and nonblank events", () => {
    expect(validateIndexedEventData(indexedEventExample).valid).toBe(true);
    expect(validateIndexedEventData(indexedEventEdgeCases.invalid).valid).toBe(
      false,
    );
    expect(
      validateIndexedEventData(indexedEventEdgeCases.duplicate).valid,
    ).toBe(false);
    expect(
      validateIndexedEventData(indexedEventEdgeCases.nonfinite).valid,
    ).toBe(false);
  });
  it("keeps caller indexes and always includes baseline 100", () => {
    expect(
      buildIndexedEventGeometry(indexedEventExample).map((d) => d.value),
    ).toEqual([100, 106, 118, 127, 139]);
    expect(getIndexedEventDomain(indexedEventEdgeCases.negativeIndex)).toEqual([
      -32, 112,
    ]);
    expect(getIndexedEventDomain(indexedEventEdgeCases.constantAt100)).toEqual([
      95, 105,
    ]);
  });
  it("extracts every trimmed event", () => {
    expect(
      getIndexedEventMarkers(indexedEventEdgeCases.multipleEvents).map(
        (e) => e.label,
      ),
    ).toEqual(["Announcement", "Market opens", "Guidance update"]);
    expect(
      buildIndexedEventGeometry(indexedEventEdgeCases.multipleEvents).at(-1)
        ?.valueLabelDy,
    ).toBe(22);
  });
  it("breaks each series independently", () => {
    expect(
      buildIndexedEventSegments(indexedEventEdgeCases.missingPrimary, "value"),
    ).toEqual([
      [0, 1],
      [3, 4],
    ]);
    expect(
      buildIndexedEventSegments(
        indexedEventEdgeCases.missingPrimary,
        "comparison",
      ),
    ).toEqual([[0, 1, 2, 3, 4]]);
  });
  it("maps equal categorical spacing and honest y geometry", () => {
    expect([0, 1, 2].map((i) => mapIndexedEventX(i, 3, [20, 220]))).toEqual([
      20, 120, 220,
    ]);
    expect(mapIndexedEventY(100, [80, 120], [100, 0])).toBe(50);
  });
});
