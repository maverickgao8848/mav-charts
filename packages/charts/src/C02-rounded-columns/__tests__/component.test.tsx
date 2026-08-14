import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RoundedColumnChart, formatRoundedColumnLabel, formatRoundedColumnValue, resolveRoundedColumnAnimation, roundedColumnEdgeCases, roundedColumnExample } from "../index";

describe("C02 Rounded Columns component", () => {
  it("renders empty and invalid states while accepting null gaps", () => {
    const { rerender } = render(<RoundedColumnChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<RoundedColumnChart data={roundedColumnEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<RoundedColumnChart data={roundedColumnEdgeCases.missing} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    expect(screen.getByRole("table", { name: "Rounded column values" })).toHaveTextContent("Missing");
  });

  it("keeps single-point detail in the accessible table", () => {
    render(<RoundedColumnChart data={roundedColumnEdgeCases.single} animate={false} />);
    expect(screen.getByRole("table", { name: "Rounded column values" })).toHaveTextContent("Single friendly KPI");
  });

  it("supports keyboard traversal, full labels and units", () => {
    render(<RoundedColumnChart data={roundedColumnExample} animate={false} seriesName="Progress" unit="%" />);
    const chart = screen.getByRole("group", { name: "Rounded columns interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Momentum: Progress 84 %; Current focus");
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Retention: Progress 57 %");
    expect(screen.getByRole("list", { name: "Rounded column legend" })).toHaveTextContent("Missing = gap");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<RoundedColumnChart data={roundedColumnExample} animate={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("formats long and extreme values and renders in SSR", () => {
    expect(formatRoundedColumnLabel("Enterprise activation")).toBe("Enterprise…");
    expect(formatRoundedColumnValue(2_000_000_000)).toBe("2B");
    expect(resolveRoundedColumnAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<RoundedColumnChart data={roundedColumnExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<RoundedColumnChart data={roundedColumnExample} />);
    expect(screen.getByRole("group", { name: "Rounded columns interactive chart" })).toHaveAttribute("data-rounded-animation", "false");
    matchMedia.mockRestore();
  });
});
