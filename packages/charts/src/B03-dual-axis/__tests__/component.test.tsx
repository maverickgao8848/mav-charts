import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DualAxisChart, dualAxisEdgeCases, dualAxisExample, formatDualAxisLabel, formatDualAxisValue, resolveDualAxisAnimation } from "../index";

describe("B03 Dual Axis component", () => {
  it("renders empty and invalid states while accepting each nullable series gap", () => {
    const { rerender } = render(<DualAxisChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<DualAxisChart data={dualAxisEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<DualAxisChart data={dualAxisEdgeCases.nonfinite} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<DualAxisChart data={dualAxisEdgeCases.missingBar} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    rerender(<DualAxisChart data={dualAxisEdgeCases.missingLine} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
  });

  it("renders one category with explicit independent unit labels", () => {
    render(<DualAxisChart data={dualAxisEdgeCases.single} animate={false} barUnit="USD" lineUnit="pct" />);
    expect(screen.getByRole("list", { name: "Series legend with independent units" })).toHaveTextContent("LEFT · USD");
    expect(screen.getByRole("list", { name: "Series legend with independent units" })).toHaveTextContent("RIGHT · pct");
    expect(screen.getByRole("table", { name: "Independent dual-axis series" })).toHaveTextContent("Single period");
  });

  it("supports keyboard traversal, direct values and independent-scale warning", () => {
    render(<DualAxisChart data={dualAxisExample} animate={false} />);
    const chart = screen.getByRole("group", { name: "Dual axis interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Jan: Revenue 38 $M; Margin 29 %");
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Jun: Revenue 71 $M; Margin 35 %");
    expect(screen.getByRole("list", { name: "Series legend with independent units" })).toHaveTextContent("INDEPENDENT SCALES");
    expect(screen.getByLabelText("Direct series values")).toHaveTextContent("PEAK REVENUE · 71 $M");
    expect(screen.getByLabelText("Direct series values")).toHaveTextContent("LATEST MARGIN · 35 %");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<DualAxisChart data={dualAxisExample} animate={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("handles labels, compact extremes, reduced motion and SSR", () => {
    expect(formatDualAxisLabel("January after migration")).toBe("January a…");
    expect(formatDualAxisValue(1_000_000_000)).toBe("1B");
    expect(resolveDualAxisAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<DualAxisChart data={dualAxisExample} animate={false} />)).not.toThrow();
  });

  it("disables both series on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<DualAxisChart data={dualAxisExample} />);
    const chart = screen.getByRole("group", { name: "Dual axis interactive chart" });
    expect(chart).toHaveAttribute("data-animation-enabled", "false");
    expect(chart).toHaveAttribute("data-bar-animation", "false");
    expect(chart).toHaveAttribute("data-line-animation", "false");
    matchMedia.mockRestore();
  });
});

