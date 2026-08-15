import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  ColumnTargetChart,
  columnTargetEdgeCases,
  columnTargetExample,
} from "../index";

describe("B02 component", () => {
  it("renders ready, empty and invalid states", () => {
    const { rerender } = render(
      <ColumnTargetChart data={columnTargetExample} animate={false} />,
    );
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    rerender(<ColumnTargetChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(
      <ColumnTargetChart
        data={columnTargetEdgeCases.nonfiniteTarget}
        animate={false}
      />,
    );
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-state",
      "invalid",
    );
  });
  it("states same-unit shared-axis and delta semantics", () => {
    render(<ColumnTargetChart animate={false} />);
    const legend = screen.getByRole("list", {
      name: "Actual and target legend",
    });
    expect(legend).toHaveTextContent("SAME UNIT / SAME AXIS");
    expect(legend).toHaveTextContent("Δ = ACTUAL − TARGET");
    expect(
      screen.getByText("LARGEST GAP · TEAM ONE · 12K BELOW"),
    ).toBeInTheDocument();
  });
  it("keeps actual and target missing independently", () => {
    render(
      <ColumnTargetChart
        data={columnTargetEdgeCases.missingBoth}
        animate={false}
      />,
    );
    expect(screen.getByRole("table")).toHaveTextContent("BMissingMissingN/A");
  });
  it("announces exact delta by keyboard", () => {
    render(<ColumnTargetChart data={columnTargetExample} animate={false} />);
    const chart = screen.getByRole("group", {
      name: "Column and target interactive chart",
    });
    fireEvent.focus(chart);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Team one: Actual 68K; Target 80K; delta 12K BELOW; first largest absolute gap",
    );
    fireEvent.keyDown(chart, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent(
      "Team four: Actual 91K; Target 80K; delta 11K ABOVE",
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
    render(<ColumnTargetChart />);
    expect(
      screen.getByRole("group", {
        name: "Column and target interactive chart",
      }),
    ).toHaveAttribute("data-column-target-animation", "false");
    matchMedia.mockRestore();
  });
  it("passes structural axe and SSR", async () => {
    const { container } = render(<ColumnTargetChart animate={false} />);
    expect(
      (
        await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
    expect(() =>
      renderToString(<ColumnTargetChart animate={false} />),
    ).not.toThrow();
  });
});
