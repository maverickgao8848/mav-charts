import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { NeedleGaugeChart, needleGaugeEdgeCases, needleGaugeExample } from "../index";

describe("P05 needle gauge component", () => {
  it("renders ready, empty and invalid states", () => { const { rerender } = render(<NeedleGaugeChart data={needleGaugeExample} animate={false} />); expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready"); rerender(<NeedleGaugeChart data={null} animate={false} />); expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty"); rerender(<NeedleGaugeChart data={needleGaugeEdgeCases.missing} animate={false} />); expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid"); });
  it("renders semantic legend, direct value and complete table", () => { render(<NeedleGaugeChart animate={false} />); expect(screen.getByRole("list", { name: "Gauge range legend" })).toHaveTextContent("Low 0–40%"); expect(screen.getByText("72%")); expect(screen.getByRole("table")).toHaveTextContent("Balanced407535%Yes"); });
  it("announces exact value, range, band and angle by keyboard", () => { render(<NeedleGaugeChart data={needleGaugeEdgeCases.negativeRange} unit="°" animate={false} />); const chart = screen.getByRole("group", { name: "Needle gauge interactive chart" }); fireEvent.focus(chart); expect(screen.getByRole("status")).toHaveTextContent("Temperature variance: -12°; range -40 to 20°; current band Expected; linear angle 96 degrees"); });
  it("does not silently clamp out-of-range values", () => { render(<NeedleGaugeChart data={needleGaugeEdgeCases.aboveRange} animate={false} />); expect(screen.getByRole("article")).toHaveAttribute("data-state", "invalid"); expect(screen.queryByRole("group", { name: "Needle gauge interactive chart" })).not.toBeInTheDocument(); });
  it("honors reduced motion internally", () => { const matchMedia = vi.spyOn(window, "matchMedia").mockReturnValue({ matches: true, media: "(prefers-reduced-motion: reduce)", onchange: null, addListener: vi.fn(), removeListener: vi.fn(), addEventListener: vi.fn(), removeEventListener: vi.fn(), dispatchEvent: vi.fn() }); render(<NeedleGaugeChart />); expect(screen.getByRole("group", { name: "Needle gauge interactive chart" })).toHaveAttribute("data-needle-animation", "false"); matchMedia.mockRestore(); });
  it("passes structural axe and SSR", async () => { const { container } = render(<NeedleGaugeChart animate={false} />); expect((await axe.run(container, { rules: { "color-contrast": { enabled: false } } })).violations).toEqual([]); expect(() => renderToString(<NeedleGaugeChart animate={false} />)).not.toThrow(); });
});

