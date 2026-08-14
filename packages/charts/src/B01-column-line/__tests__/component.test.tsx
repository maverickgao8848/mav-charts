import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  ColumnLineChart,
  columnLineEdgeCases,
  columnLineExample,
} from "../index";

describe("B01 component", () => {
  it("renders ready, empty and invalid states", () => {
    const { rerender } = render(
      <ColumnLineChart data={columnLineExample} animate={false} />,
    );
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    rerender(<ColumnLineChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(
      <ColumnLineChart data={columnLineEdgeCases.rateAbove} animate={false} />,
    );
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-state",
      "invalid",
    );
  });
  it("states both axes and the fixed percentage contract", () => {
    render(<ColumnLineChart animate={false} />);
    const legend = screen.getByRole("list", {
      name: "Scale and bounded rate legend",
    });
    expect(legend).toHaveTextContent("LEFT");
    expect(legend).toHaveTextContent("ZERO-BASED");
    expect(legend).toHaveTextContent("RIGHT");
    expect(legend).toHaveTextContent("FIXED 0–100");
    expect(legend).toHaveTextContent("POSITIONS ARE NOT EQUAL VALUES");
  });
  it("keeps independent missing values in the accessible table", () => {
    render(
      <ColumnLineChart
        data={columnLineEdgeCases.missingBoth}
        animate={false}
      />,
    );
    expect(screen.getByRole("table")).toHaveTextContent("FebMissingMissing");
  });
  it("announces exact values by keyboard", () => {
    render(<ColumnLineChart data={columnLineExample} animate={false} />);
    const chart = screen.getByRole("group", {
      name: "Column and percentage line interactive chart",
    });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Q1: Orders 128K; Conversion 28%",
    );
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Q4: Orders 173K; Conversion 42%",
    );
  });
  it("honors reduced motion internally", () => {
    const matchMedia = vi
      .spyOn(window, "matchMedia")
      .mockReturnValue({
        matches: true,
        media: "(prefers-reduced-motion: reduce)",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });
    render(<ColumnLineChart />);
    expect(
      screen.getByRole("group", {
        name: "Column and percentage line interactive chart",
      }),
    ).toHaveAttribute("data-column-line-animation", "false");
    matchMedia.mockRestore();
  });
  it("passes structural axe and SSR", async () => {
    const { container } = render(<ColumnLineChart animate={false} />);
    expect(
      (
        await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
    expect(() =>
      renderToString(<ColumnLineChart animate={false} />),
    ).not.toThrow();
  });
});
