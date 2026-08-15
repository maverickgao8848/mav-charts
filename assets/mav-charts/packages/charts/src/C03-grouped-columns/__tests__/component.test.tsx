import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GroupedColumnChart, formatGroupedColumnLabel, formatGroupedColumnValue, groupedColumnEdgeCases, groupedColumnExample, resolveGroupedColumnAnimation } from "../index";

describe("C03 Grouped Columns component", () => {
  it("renders empty and invalid states while accepting independent gaps", () => {
    const { rerender } = render(<GroupedColumnChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<GroupedColumnChart data={groupedColumnEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<GroupedColumnChart data={groupedColumnEdgeCases.missingPrimary} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    expect(screen.getByRole("table", { name: "Grouped column values" })).toHaveTextContent("Missing");
  });

  it("supports keyboard traversal, legend and full paired status", () => {
    render(<GroupedColumnChart data={groupedColumnExample} animate={false} primaryName="Current" comparisonName="Prior" unit="pts" />);
    const chart = screen.getByRole("group", { name: "Grouped columns interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Momentum: Current 84 pts; Prior 62 pts; Current focus");
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Retention: Current 57 pts; Prior 71 pts");
    expect(screen.getByRole("list", { name: "Grouped column legend" })).toHaveTextContent("Missing = gap");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<GroupedColumnChart data={groupedColumnExample} animate={false} />);
    expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });

  it("formats long and extreme values and renders on the server", () => {
    expect(formatGroupedColumnLabel("Enterprise activation completion")).toBe("Enterprise…");
    expect(formatGroupedColumnValue(2_000_000_000)).toBe("2B");
    expect(resolveGroupedColumnAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<GroupedColumnChart data={groupedColumnExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<GroupedColumnChart data={groupedColumnExample} />);
    expect(screen.getByRole("group", { name: "Grouped columns interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });
});
