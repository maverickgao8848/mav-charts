import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { DumbbellChart, dumbbellExample, formatDumbbellLabel, resolveDumbbellAnimation } from "../index";

describe("C11 Dumbbell component", () => {
  it("renders empty and invalid states", () => {
    const { rerender } = render(<DumbbellChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<DumbbellChart data={[{ label: "", before: 1, after: Number.NaN }]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid");
  });

  it("exposes a keyboard tooltip for each row", () => {
    render(<DumbbellChart data={[{ label: "North", before: 10, after: 18 }]} animate={false} />);
    const row = screen.getByRole("graphics-symbol", { name: /North/ });
    fireEvent.focus(row);
    expect(screen.getByRole("status")).toHaveTextContent("North: 10 → 18 (+8)");
    expect(screen.getByRole("list", { name: "Legend" })).toBeInTheDocument();
  });

  it("has no ready-state structural axe violations", async () => {
    const { container } = render(<DumbbellChart data={dumbbellExample} animate={false} />);
    const result = await axe.run(container, { rules: { "color-contrast": { enabled: false } } });
    expect(result.violations).toEqual([]);
  });

  it("handles reduced motion, long labels and SSR", () => {
    expect(resolveDumbbellAnimation(undefined, true)).toBe(false);
    expect(formatDumbbellLabel("A deliberately long operating region")).toBe("A deliberately…");
    expect(() => renderToString(<DumbbellChart data={dumbbellExample} animate={false} />)).not.toThrow();
  });

  it("disables animation on the first render for reduced-motion users", () => {
    const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() });
    const { container } = render(<DumbbellChart data={dumbbellExample} />);
    expect(container.querySelector('[data-animation-enabled="false"]')).toBeInTheDocument();
    expect(container.querySelectorAll("[data-mav-entry]")).toHaveLength(0);
    matchMedia.mockRestore();
  });

  it("renders observable SVG entry animations for normal motion preferences", () => {
    const { container } = render(<DumbbellChart data={dumbbellExample} animate />);
    expect(container.querySelectorAll('[data-mav-entry="opacity"]')).toHaveLength(dumbbellExample.length);
    expect(container.querySelectorAll('[data-mav-entry="connector"]')).toHaveLength(dumbbellExample.length);
  });
});
