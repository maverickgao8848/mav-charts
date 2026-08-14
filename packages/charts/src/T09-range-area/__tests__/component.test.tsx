import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RangeAreaChart, formatRangeAreaLabel, formatRangeAreaValue, rangeAreaExample, resolveRangeAreaAnimation } from "../index";

describe("T09 Range Area component", () => {
  it("renders empty and invalid states", () => {
    const { rerender } = render(<RangeAreaChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<RangeAreaChart data={[{ label: "Bad", low: 4, median: null, high: 8 }]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
  });

  it("supports keyboard traversal, Tooltip and Legend", () => {
    render(<RangeAreaChart data={rangeAreaExample} animate={false} />);
    const chart = screen.getByRole("group", { name: "Range area interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Jan: median 43; range 34–52");
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("Feb: median 48");
    expect(screen.getByRole("list", { name: "Legend" })).toBeInTheDocument();
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<RangeAreaChart data={rangeAreaExample} animate={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("handles label truncation, reduced motion and SSR", () => {
    expect(formatRangeAreaLabel("January after reset")).toBe("January a…");
    expect(formatRangeAreaValue(500_000)).toBe("500K");
    expect(formatRangeAreaValue(-1_250_000)).toBe("-1.3M");
    expect(resolveRangeAreaAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<RangeAreaChart data={rangeAreaExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<RangeAreaChart data={rangeAreaExample} />);
    expect(screen.getByRole("group", { name: "Range area interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });
});
