import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { SimpleColumnChart, formatSimpleColumnLabel, formatSimpleColumnValue, resolveSimpleColumnAnimation, simpleColumnEdgeCases, simpleColumnExample } from "../index";

describe("C01 Simple Columns component", () => {
  it("renders empty and invalid states while accepting missing values", () => {
    const { rerender } = render(<SimpleColumnChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<SimpleColumnChart data={simpleColumnEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<SimpleColumnChart data={simpleColumnEdgeCases.missing} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    expect(screen.getByRole("table", { name: "Simple column values" })).toHaveTextContent("Missing");
  });

  it("renders a single category with full accessible information", () => {
    render(<SimpleColumnChart data={simpleColumnEdgeCases.single} animate={false} unit="%" />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    expect(screen.getByRole("table", { name: "Simple column values" })).toHaveTextContent("Only category");
    expect(screen.getByRole("table", { name: "Simple column values" })).toHaveTextContent("Single observation");
  });

  it("supports keyboard traversal, unit legend and full-label status", () => {
    render(<SimpleColumnChart data={simpleColumnExample} animate={false} seriesName="Revenue" unit="$M" />);
    const chart = screen.getByRole("group", { name: "Simple columns interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("North: Revenue 72 $M; Largest region");
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("East: Revenue 31 $M");
    expect(screen.getByRole("list", { name: "Column legend" })).toHaveTextContent("Missing = gap");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<SimpleColumnChart data={simpleColumnExample} animate={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("handles long labels, compact extremes, reduced motion and SSR", () => {
    expect(formatSimpleColumnLabel("North American enterprise")).toBe("North Amer…");
    expect(formatSimpleColumnValue(1_000_000_000)).toBe("1B");
    expect(resolveSimpleColumnAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<SimpleColumnChart data={simpleColumnExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<SimpleColumnChart data={simpleColumnExample} />);
    const chart = screen.getByRole("group", { name: "Simple columns interactive chart" });
    expect(chart).toHaveAttribute("data-animation-enabled", "false");
    expect(chart).toHaveAttribute("data-column-animation", "false");
    matchMedia.mockRestore();
  });
});

