import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { StackedColumnChart, formatStackedColumnLabel, formatStackedColumnValue, resolveStackedColumnAnimation, stackedColumnEdgeCases, stackedColumnExample } from "../index";

describe("C04 Stacked Columns component", () => {
  it("renders empty and invalid states while preserving missing totals", () => {
    const { rerender } = render(<StackedColumnChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<StackedColumnChart data={stackedColumnEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<StackedColumnChart data={stackedColumnEdgeCases.missingValue} animate={false} />);
    const table = screen.getByRole("table", { name: "Stacked column values" });
    expect(table).toHaveTextContent("Missing");
    expect(table).toHaveTextContent("Base not reported");
  });

  it("supports category keyboard status with complete total semantics", () => {
    render(<StackedColumnChart data={stackedColumnExample} animate={false} baseName="Core" upperName="Expansion" unit="pts" />);
    const chart = screen.getByRole("group", { name: "Stacked columns interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Momentum: Core 64 pts; Expansion 36 pts; total 100 pts; Largest base segment");
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Retention: Core 72 pts; Expansion 28 pts; total 100 pts");
    expect(screen.getByRole("list", { name: "Stacked column legend" })).toHaveTextContent("Missing ≠ 0");
  });

  it("reports mixed-sign net without changing stack extents", () => {
    render(<StackedColumnChart data={stackedColumnEdgeCases.negative} animate={false} />);
    const chart = screen.getByRole("group", { name: "Stacked columns interactive chart" });
    fireEvent.focus(chart);
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("South: Core -4; Expansion 7; net 3");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<StackedColumnChart data={stackedColumnExample} animate={false} />);
    expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });

  it("formats long/extreme values and renders on the server", () => {
    expect(formatStackedColumnLabel("Enterprise activation completion")).toBe("Enterprise…");
    expect(formatStackedColumnValue(2_000_000_000)).toBe("2B");
    expect(resolveStackedColumnAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<StackedColumnChart data={stackedColumnExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<StackedColumnChart data={stackedColumnExample} />);
    expect(screen.getByRole("group", { name: "Stacked columns interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });
});
