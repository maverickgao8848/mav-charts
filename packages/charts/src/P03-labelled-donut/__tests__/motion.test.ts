import { describe, expect, it } from "vitest";
import { getLabelledDonutMotion } from "../motion";

describe("P03 motion", () => {
  it("provides real Recharts entry and static first frame", () => {
    expect(getLabelledDonutMotion("signal", true)).toMatchObject({ enabled: true, duration: 720, initialOpacity: 0 });
    expect(getLabelledDonutMotion("digital", false)).toMatchObject({ enabled: false, duration: 0, initialOpacity: 1 });
  });
});
