import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { TimelineChart, formatTimelineDuration, formatTimelineLabel, formatTimelineValue, resolveTimelineAnimation, timelineEdgeCases, timelineExample } from "../index";

describe("F03 Timeline component", () => {
  it("renders empty, missing and inverted states explicitly", () => {
    const { rerender } = render(<TimelineChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<TimelineChart data={timelineEdgeCases.missing} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    rerender(<TimelineChart data={timelineEdgeCases.inverted} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
  });

  it("renders single and zero-duration milestone data honestly", () => {
    const { rerender } = render(<TimelineChart data={timelineEdgeCases.single} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    rerender(<TimelineChart data={timelineEdgeCases.zeroDuration} animate={false} />);
    expect(screen.getByRole("table", { name: "Timeline intervals" })).toHaveTextContent("Decision");
    expect(screen.getByRole("table", { name: "Timeline intervals" })).toHaveTextContent("Milestone");
  });

  it("supports keyboard traversal, direct labels and HTML legend", () => {
    render(<TimelineChart data={timelineExample} animate={false} />);
    const chart = screen.getByRole("group", { name: "Timeline interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Policy: 2022 to 2022.8; duration 0.8");
    fireEvent.keyDown(chart, { key: "ArrowRight" });
    expect(screen.getByRole("status")).toHaveTextContent("Pilot: 2022.6 to 2024; duration 1.4");
    expect(screen.getByRole("list", { name: "Timeline legend" })).toHaveTextContent("Lane = overlap only");
  });

  it("provides exact mouse tooltip content", () => {
    const { container } = render(<TimelineChart data={timelineExample} animate={false} />);
    fireEvent.mouseEnter(container.querySelector('[data-timeline-item="Scale"]')!);
    expect(screen.getByRole("tooltip")).toHaveTextContent("2023.5 → 2025.2");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Duration 1.7");
    expect(screen.getByRole("tooltip")).toHaveTextContent("Capacity expansion");
    expect(screen.getByRole("table", { name: "Timeline intervals" }).querySelector("tbody tr:nth-child(3)")).toHaveTextContent("1.7");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<TimelineChart data={timelineExample} animate={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("handles labels, compact extremes, reduced motion and SSR", () => {
    expect(formatTimelineLabel("International production capacity")).toBe("International…");
    expect(formatTimelineValue(2022.8)).toBe("2022.8");
    expect(formatTimelineDuration(2025.2 - 2023.5)).toBe("1.7");
    expect(formatTimelineValue(1_000_000_000)).toBe("1B");
    expect(resolveTimelineAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<TimelineChart data={timelineExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<TimelineChart data={timelineExample} />);
    expect(screen.getByRole("group", { name: "Timeline interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });
});
