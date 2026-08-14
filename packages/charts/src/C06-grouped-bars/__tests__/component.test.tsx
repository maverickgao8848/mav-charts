import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { GroupedBarChart, formatGroupedBarLabel, formatGroupedBarValue, groupedBarEdgeCases, groupedBarExample } from "../index";

describe("C06 Grouped Bars component", () => {
  it("renders empty, invalid and independent missing states", () => {
    const { rerender } = render(<GroupedBarChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<GroupedBarChart data={groupedBarEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<GroupedBarChart data={groupedBarEdgeCases.missingPrimary} animate={false} />);
    expect(screen.getByRole("table", { name: "Grouped bar values" })).toHaveTextContent("Missing");
  });
  it("supports ordered keyboard traversal and paired status", () => {
    render(<GroupedBarChart data={groupedBarExample} animate={false} unit="pts" />);
    const chart = screen.getByRole("group", { name: "Grouped bars interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("North America: Current 84 pts; Prior 62 pts");
    fireEvent.keyDown(chart, { key: "ArrowDown" });
    expect(screen.getByRole("status")).toHaveTextContent("Europe: Current 68 pts; Prior 74 pts");
    expect(screen.getByRole("list", { name: "Grouped bar legend" })).toHaveTextContent("Missing = gap");
  });
  it("passes structural axe", async () => {
    const { container } = render(<GroupedBarChart animate={false} />);
    expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });
  it("formats long and extreme values and renders SSR", () => {
    expect(formatGroupedBarLabel("Enterprise customers across territories")).toBe("Enterprise customer…");
    expect(formatGroupedBarValue(2_400_000_000)).toBe("2.4B");
    expect(() => renderToString(<GroupedBarChart animate={false} />)).not.toThrow();
  });
  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<GroupedBarChart />);
    expect(screen.getByRole("group", { name: "Grouped bars interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });
});
