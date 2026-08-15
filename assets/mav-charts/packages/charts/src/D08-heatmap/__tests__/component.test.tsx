import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HeatmapChart, formatHeatmapLabel, formatHeatmapValue, heatmapEdgeCases, heatmapExample, resolveHeatmapAnimation } from "../index";

describe("D08 Heatmap component", () => {
  it("renders empty and duplicate states explicitly while accepting missing cells", () => {
    const { rerender } = render(<HeatmapChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<HeatmapChart data={heatmapEdgeCases.duplicate} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<HeatmapChart data={heatmapEdgeCases.missing} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    expect(screen.getByRole("table", { name: "Complete heatmap grid" })).toHaveTextContent("Missing");
  });

  it("renders a single categorical cell and direct peak label", () => {
    render(<HeatmapChart data={heatmapEdgeCases.single} animate={false} />);
    expect(screen.getByLabelText("Peak 42 at Mon, 12")).toHaveTextContent("PEAK · 42");
    expect(screen.getByRole("table", { name: "Complete heatmap grid" })).toHaveTextContent("Only observation");
  });

  it("supports two-dimensional keyboard traversal and the HTML color legend", () => {
    render(<HeatmapChart data={heatmapEdgeCases.constant} animate={false} />);
    const chart = screen.getByRole("group", { name: "Heatmap interactive grid" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("North, Q1: 42");
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("North, Q2: 42");
    fireEvent.keyDown(chart, { key: "ArrowDown" });
    expect(screen.getByRole("status")).toHaveTextContent("South, Q2: 42");
    expect(screen.getByRole("list", { name: "Continuous color scale and missing legend" })).toHaveTextContent("Missing");
  });

  it("provides exact mouse tooltip content", () => {
    const { container } = render(<HeatmapChart data={heatmapEdgeCases.missing} animate={false} />);
    fireEvent.mouseEnter(container.querySelector('[data-heatmap-cell="Mon/PM"]')!);
    expect(screen.getByRole("tooltip")).toHaveTextContent("Mon · PM");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Missing");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<HeatmapChart data={heatmapExample} animate={false} />);
    expect(screen.getByLabelText("Peak 100 at Wed, 12")).toBeInTheDocument();
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("handles labels, compact extremes, reduced motion and SSR", () => {
    expect(formatHeatmapLabel("North American enterprise")).toBe("North Americ…");
    expect(formatHeatmapValue(1_000_000_000)).toBe("1B");
    expect(resolveHeatmapAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<HeatmapChart data={heatmapExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<HeatmapChart data={heatmapExample} />);
    expect(screen.getByRole("group", { name: "Heatmap interactive grid" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });
});
