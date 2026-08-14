import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { RadialProgressChart, formatRadialProgressLabel, formatRadialProgressValue, radialProgressEdgeCases, radialProgressExample, resolveRadialProgressAnimation } from "../index";

describe("P04 Radial Progress component", () => {
  it("renders empty and every invalid percentage state explicitly", () => {
    const { rerender } = render(<RadialProgressChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    for (const data of [radialProgressEdgeCases.missing, radialProgressEdgeCases.invalid, radialProgressEdgeCases.negative, radialProgressEdgeCases.over100]) {
      rerender(<RadialProgressChart data={data} animate={false} />);
      expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
    }
  });

  it("renders a single percentage without inventing extra KPIs", () => {
    render(<RadialProgressChart data={radialProgressEdgeCases.single} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    expect(screen.getByLabelText("Direct percentage labels")).toHaveTextContent("78%");
    expect(screen.getByRole("table", { name: "Radial progress percentages" })).toHaveTextContent("Single KPI");
  });

  it("supports keyboard traversal, direct labels, Tooltip and Legend", () => {
    render(<RadialProgressChart data={radialProgressExample} animate={false} />);
    const chart = screen.getByRole("group", { name: "Radial progress interactive chart" });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent("Activation: 78% complete");
    fireEvent.keyDown(chart, { key: "ArrowDown" });
    expect(screen.getByRole("status")).toHaveTextContent("Retention: 64% complete");
    expect(screen.getByRole("list", { name: "Legend" })).toBeInTheDocument();
    expect(screen.getByLabelText("Direct percentage labels")).toHaveTextContent("49%");
  });

  it("passes structural axe in ready state", async () => {
    const { container } = render(<RadialProgressChart data={radialProgressExample} animate={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("handles long labels, exact percentages, reduced motion and SSR", () => {
    expect(formatRadialProgressLabel("Activation after onboarding")).toBe("Activation after …");
    expect(formatRadialProgressValue(99.99)).toBe("99.99%");
    expect(resolveRadialProgressAnimation(undefined, true)).toBe(false);
    expect(() => renderToString(<RadialProgressChart data={radialProgressExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first reduced-motion render", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    render(<RadialProgressChart data={radialProgressExample} />);
    expect(screen.getByRole("group", { name: "Radial progress interactive chart" })).toHaveAttribute("data-animation-enabled", "false");
    matchMedia.mockRestore();
  });
});

