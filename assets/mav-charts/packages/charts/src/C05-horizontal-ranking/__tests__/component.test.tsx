import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { HorizontalRankingChart, formatHorizontalRankingLabel, formatHorizontalRankingValue, horizontalRankingEdgeCases, horizontalRankingExample, resolveHorizontalRankingAnimation } from "../index";

describe("C05 Horizontal Ranking component", () => {
  it("renders empty/invalid states and keeps missing as an unranked row", () => {
    const { rerender } = render(<HorizontalRankingChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<HorizontalRankingChart data={horizontalRankingEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<HorizontalRankingChart data={horizontalRankingEdgeCases.missing} animate={false} />);
    const table = screen.getByRole("table", { name: "Horizontal ranking values" });
    expect(table).toHaveTextContent("Not reported");
    expect(table).toHaveTextContent("Missing");
  });

  it("supports keyboard traversal in sorted order and preserves full names", () => {
    render(<HorizontalRankingChart data={horizontalRankingExample} animate={false} seriesName="Contribution" unit="pts" />);
    const chart = screen.getByRole("group", { name: "Horizontal ranking interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Rank 1: Enterprise; Contribution 173 pts; Largest contribution");
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Rank 3: Partner network; Contribution 96 pts");
  });

  it("announces a missing final row without assigning zero or a rank", () => {
    render(<HorizontalRankingChart data={horizontalRankingEdgeCases.missing} animate={false} />);
    const chart = screen.getByRole("group", { name: "Horizontal ranking interactive chart" });
    fireEvent.focus(chart);
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Missing rank: Not reported; Value missing; Missing remains a row");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<HorizontalRankingChart data={horizontalRankingExample} animate={false} />);
    expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]);
  });

  it("formats compact labels/values and renders on the server", () => {
    expect(formatHorizontalRankingLabel("Enterprise activation completion")).toBe("Enterprise activ…");
    expect(formatHorizontalRankingValue(2_000_000_000)).toBe("2B");
    expect(resolveHorizontalRankingAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<HorizontalRankingChart data={horizontalRankingExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<HorizontalRankingChart data={horizontalRankingExample} />);
    expect(screen.getByRole("group", { name: "Horizontal ranking interactive chart" })).toHaveAttribute("data-ranking-animation", "false");
    matchMedia.mockRestore();
  });
});
