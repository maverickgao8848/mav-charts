import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { BubbleQuadrantChart, bubbleQuadrantEdgeCases, bubbleQuadrantExample, formatBubbleQuadrantLabel, formatBubbleQuadrantValue, resolveBubbleQuadrantAnimation } from "../index";

describe("D03 Bubble Quadrant component", () => {
  it("renders empty, missing and invalid states", () => {
    const { rerender } = render(<BubbleQuadrantChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<BubbleQuadrantChart data={bubbleQuadrantEdgeCases.missing} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<BubbleQuadrantChart data={bubbleQuadrantEdgeCases.invalid} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
  });

  it("renders single and zero-size observations without inventing area", () => {
    const { rerender } = render(<BubbleQuadrantChart data={bubbleQuadrantEdgeCases.single} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    rerender(<BubbleQuadrantChart data={bubbleQuadrantEdgeCases.zeroSize} animate={false} />);
    expect(screen.getByRole("table", { name: "Bubble quadrant values" })).toHaveTextContent("No volume");
  });

  it("supports keyboard traversal, Tooltip, direct labels and Legend", () => {
    render(<BubbleQuadrantChart data={bubbleQuadrantExample} animate={false} />);
    const chart = screen.getByRole("group", { name: "Bubble quadrant interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Nova: X 84; Y 74; size 42; Leaders");
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("Axis: X 66");
    expect(screen.getByRole("list", { name: "Quadrant and size legend" })).toHaveTextContent("Bubble area = size");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<BubbleQuadrantChart data={bubbleQuadrantExample} animate={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("handles long labels, compact extremes, reduced motion and SSR", () => {
    expect(formatBubbleQuadrantLabel("North American enterprise")).toBe("North Americ…");
    expect(formatBubbleQuadrantValue(2_000_000)).toBe("2M");
    expect(resolveBubbleQuadrantAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<BubbleQuadrantChart data={bubbleQuadrantExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<BubbleQuadrantChart data={bubbleQuadrantExample} />);
    expect(screen.getByRole("group", { name: "Bubble quadrant interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });
});

