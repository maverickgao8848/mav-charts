import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ProfitBridgeChart, formatProfitBridgeLabel, profitBridgeExample, resolveChartAnimation } from "../index";

describe("C10 ProfitBridgeChart states and accessibility", () => {
  it("renders an explicit empty state", () => {
    render(<ProfitBridgeChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    expect(screen.getByRole("status")).toHaveTextContent("No data available");
  });

  it("renders an invalid state for a malformed sequence", () => {
    render(<ProfitBridgeChart data={[{ label: "Wrong", value: 12, kind: "change" }]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    expect(screen.getByRole("status")).toHaveTextContent("supplied data is invalid");
  });

  it("has no baseline accessibility violations in its empty state", async () => {
    const { container } = render(<ProfitBridgeChart data={[]} animate={false} visualSystem="digital" />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("supports keyboard traversal and a ready-state tooltip", () => {
    render(<ProfitBridgeChart data={profitBridgeExample} animate={false} />);
    const chart = screen.getByRole("group", { name: "Profit bridge interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Base: 78");
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("Price: +12; running total 90");
    expect(screen.getByRole("list", { name: "Legend" })).toBeInTheDocument();
  });

  it("has no ready-state structural axe violations", async () => {
    const { container } = render(<ProfitBridgeChart data={profitBridgeExample} animate={false} visualSystem="editorial" />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("resolves reduced motion internally and truncates long labels deterministically", () => {
    expect(resolveChartAnimation(undefined, true)).toBe(false);
    expect(resolveChartAnimation(undefined, false)).toBe(true);
    expect(resolveChartAnimation(true, true)).toBe(true);
    expect(formatProfitBridgeLabel("One-off revaluation")).toBe("One-off rev…");
  });

  it("disables animation on the first render when the user prefers reduced motion", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<ProfitBridgeChart data={profitBridgeExample} />);
    expect(screen.getByRole("group", { name: "Profit bridge interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });

  it("renders safely during SSR", () => {
    expect(() => renderToString(<ProfitBridgeChart data={profitBridgeExample} animate={false} />)).not.toThrow();
  });
});
