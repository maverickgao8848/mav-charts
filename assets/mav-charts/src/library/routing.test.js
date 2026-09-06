import { describe, expect, it } from "vitest";
import { readWorkbenchUrl } from "./routing";

describe("workbench routing", () => {
  it("reads restorable filters and selection", () => {
    expect(readWorkbenchUrl("?chart=T02&question=trend&q=revenue&system=digital")).toEqual({
      chart: "T02", question: "trend", query: "revenue", system: "digital",
    });
  });
  it("provides safe defaults", () => {
    expect(readWorkbenchUrl("")).toEqual({ chart: "", question: "all", query: "", system: "signal" });
  });
});
