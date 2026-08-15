import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { PieCompositionChart, pieEdgeCases, pieExample } from "../index";

describe("P01 pie component", () => {
  it("renders ready, empty and invalid states", () => { const { rerender } = render(<PieCompositionChart data={pieExample} animate={false} />); expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready"); rerender(<PieCompositionChart data={[]} animate={false} />); expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty"); rerender(<PieCompositionChart data={pieEdgeCases.allZero} animate={false} />); expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid"); });
  it("renders semantic legend and complete table", () => { render(<PieCompositionChart animate={false} />); expect(screen.getByRole("list", { name: "Pie legend" })).toHaveTextContent("Core product42%"); expect(screen.getByRole("table")).toHaveTextContent("Core product4242%151.2"); });
  it("keeps missing distinct from zero", () => { const { rerender } = render(<PieCompositionChart data={pieEdgeCases.missing} animate={false} />); expect(screen.getByRole("table")).toHaveTextContent("Awaiting sourceMissingN/AN/A"); rerender(<PieCompositionChart data={pieEdgeCases.zero} animate={false} />); expect(screen.getByRole("table")).toHaveTextContent("No contribution00%0"); });
  it("announces every ordered row by keyboard", () => { render(<PieCompositionChart data={pieEdgeCases.missing} animate={false} />); const chart = screen.getByRole("group", { name: "Pie composition interactive chart" }); fireEvent.focus(chart); expect(screen.getByRole("status")).toHaveTextContent("Reported: 70; 70% of known total; first positive focus"); fireEvent.keyDown(chart, { key: "ArrowRight" }); expect(screen.getByRole("status")).toHaveTextContent("Awaiting source: Missing; share N/A"); });
  it("honors reduced motion internally", () => { const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() }); render(<PieCompositionChart />); expect(screen.getByRole("group", { name: "Pie composition interactive chart" })).toHaveAttribute("data-pie-animation", "false"); matchMedia.mockRestore(); });
  it("passes structural axe and SSR", async () => { const { container } = render(<PieCompositionChart animate={false} />); expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]); expect(() => renderToString(<PieCompositionChart animate={false} />)).not.toThrow(); });
});

