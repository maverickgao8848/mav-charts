import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ValueDotLineChart, valueDotLineEdgeCases, valueDotLineExample } from "../index";

describe("T04 Value Dot Line component", () => {
  it("renders ready, empty and invalid states", () => {
    const { rerender } = render(<ValueDotLineChart data={valueDotLineExample} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    rerender(<ValueDotLineChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<ValueDotLineChart data={valueDotLineEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
  });

  it("renders a direct label for every finite observation and retains missing rows", () => {
    render(<ValueDotLineChart data={valueDotLineEdgeCases.missing} animate={false} />);
    expect(screen.getByRole("table")).toHaveTextContent("Feb");
    expect(screen.getByRole("table")).toHaveTextContent("Missing");
  });

  it("supports keyboard status including missing rows", () => {
    render(<ValueDotLineChart data={valueDotLineEdgeCases.missing} animate={false} unit=" pts" />);
    const chart = screen.getByRole("group", { name: "Value dot line interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Jan: Value 12 pts");
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("Feb: Missing; line breaks here");
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Apr: Value 23 pts");
  });

  it("renders the HTML legend and full long labels in the table", () => {
    render(<ValueDotLineChart data={valueDotLineEdgeCases.longLabel} animate={false} />);
    expect(screen.getByRole("list", { name: "Value dot line legend" })).toHaveTextContent("direct labels");
    expect(screen.getByRole("table")).toHaveTextContent("First enterprise reporting interval");
  });

  it("honors reduced motion internally", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({
      matches: true,
      media: "(prefers-reduced-motion: reduce)",
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    });
    render(<ValueDotLineChart />);
    expect(screen.getByRole("group", { name: "Value dot line interactive chart" })).toHaveAttribute("data-value-dot-animation", "false");
    matchMedia.mockRestore();
  });

  it("passes structural axe and SSR", async () => {
    const { container } = render(<ValueDotLineChart animate={false} />);
    expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
    expect(() => renderToString(<ValueDotLineChart animate={false} />)).not.toThrow();
  });
});
