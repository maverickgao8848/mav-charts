import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TrendLineChart, trendLineEdgeCases, trendLineExample } from "../index";

describe("T01 Trend Line component", () => {
  it("renders ready, empty and invalid states", () => {
    const { rerender } = render(<TrendLineChart data={trendLineExample} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    rerender(<TrendLineChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<TrendLineChart data={trendLineEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
  });

  it("retains missing observations in the accessible table", () => {
    render(<TrendLineChart data={trendLineEdgeCases.missing} animate={false} />);
    expect(screen.getByRole("table")).toHaveTextContent("Feb");
    expect(screen.getByRole("table")).toHaveTextContent("Missing");
  });

  it("supports keyboard observation status including missing rows", () => {
    render(<TrendLineChart data={trendLineEdgeCases.missing} animate={false} unit=" pts" />);
    const chart = screen.getByRole("group", { name: "Trend line interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Jan: Value 12 pts");
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("Feb: Missing; line breaks here");
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Apr: Value 23 pts");
  });

  it("renders the HTML legend and full long labels in the table", () => {
    render(<TrendLineChart data={trendLineEdgeCases.longLabel} animate={false} />);
    expect(screen.getByRole("list", { name: "Trend line legend" })).toHaveTextContent("Missing = line break");
    expect(screen.getByRole("table")).toHaveTextContent("First enterprise reporting interval");
  });

  it("honors reduced motion internally", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<TrendLineChart />);
    expect(screen.getByRole("group", { name: "Trend line interactive chart" })).toHaveAttribute("data-trend-animation", "false");
    matchMedia.mockRestore();
  });

  it("passes structural axe and SSR", async () => {
    const { container } = render(<TrendLineChart animate={false} />);
    expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
    expect(() => renderToString(<TrendLineChart animate={false} />)).not.toThrow();
  });
});
