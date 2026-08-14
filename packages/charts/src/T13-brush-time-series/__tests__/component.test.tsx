import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BrushTimeSeriesChart, brushTimeSeriesEdgeCases, brushTimeSeriesExample, formatBrushTimeSeriesLabel, formatBrushTimeSeriesValue, resolveBrushTimeSeriesAnimation } from "../index";

describe("T13 Brush Time Series component", () => {
  it("renders empty, missing and invalid states", () => {
    const { rerender } = render(<BrushTimeSeriesChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<BrushTimeSeriesChart data={[{ label: "13:00", value: null }]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<BrushTimeSeriesChart data={[{ label: "", value: 2 }]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
  });

  it("renders a single observation without inventing extra data", () => {
    render(<BrushTimeSeriesChart data={brushTimeSeriesEdgeCases.single} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    expect(screen.getByLabelText("Latest value 42")).toHaveTextContent("LATEST · 42");
    expect(screen.getByRole("table", { name: "Time series values" })).toHaveTextContent("Only observation");
  });

  it("supports keyboard traversal, direct label, Tooltip and Legend", () => {
    render(<BrushTimeSeriesChart data={brushTimeSeriesExample} animate={false} />);
    const chart = screen.getByRole("group", { name: "Brush and zoom time series interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("00:00: 42; Overnight");
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("23:00: 121; Evening");
    expect(screen.getByRole("list", { name: "Legend" })).toBeInTheDocument();
    expect(screen.getByLabelText("Latest value 121")).toHaveTextContent("LATEST · 121");
  });

  it("announces the selected time range", () => {
    render(<BrushTimeSeriesChart data={brushTimeSeriesExample} animate={false} />);
    expect(screen.getByText("Selected time range from 00:00 to 23:00")).toHaveAttribute("aria-live", "polite");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<BrushTimeSeriesChart data={brushTimeSeriesExample} animate={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("handles label truncation, compact values, reduced motion and SSR", () => {
    expect(formatBrushTimeSeriesLabel("Infrastructure migration")).toBe("Infrastruc…");
    expect(formatBrushTimeSeriesValue(1_000_000)).toBe("1M");
    expect(formatBrushTimeSeriesValue(-1_250)).toBe("-1.3K");
    expect(resolveBrushTimeSeriesAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<BrushTimeSeriesChart data={brushTimeSeriesExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<BrushTimeSeriesChart data={brushTimeSeriesExample} />);
    expect(screen.getByRole("group", { name: "Brush and zoom time series interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });
});
