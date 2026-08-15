import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import {
  QuadrantScatterChart,
  quadrantScatterEdgeCases,
  quadrantScatterExample,
} from "../index";
describe("D02 component", () => {
  it("renders ready, empty and invalid states", () => {
    const { rerender } = render(
      <QuadrantScatterChart data={quadrantScatterExample} animate={false} />,
    );
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    rerender(<QuadrantScatterChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(
      <QuadrantScatterChart
        data={quadrantScatterEdgeCases.duplicate}
        animate={false}
      />,
    );
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-state",
      "invalid",
    );
    rerender(<QuadrantScatterChart thresholdX={Infinity} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-state",
      "invalid",
    );
  });
  it("retains missing whole points in the table", () => {
    render(
      <QuadrantScatterChart
        data={quadrantScatterEdgeCases.missing}
        animate={false}
      />,
    );
    expect(screen.getByRole("table")).toHaveTextContent("Missing X");
    expect(screen.getByRole("table")).toHaveTextContent("Missing whole point");
    expect(
      screen.getByRole("group", { name: "Quadrant scatter interactive chart" }),
    ).toHaveAttribute("data-visible-points", "1");
  });
  it("reports boundaries and supports keyboard status", () => {
    render(
      <QuadrantScatterChart
        data={quadrantScatterEdgeCases.boundary}
        animate={false}
      />,
    );
    const group = screen.getByRole("group", {
      name: "Quadrant scatter interactive chart",
    });
    fireEvent.focus(group);
    expect(screen.getByRole("status")).toHaveTextContent("On boundary");
    fireEvent.keyDown(group, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Crossing");
  });
  it("renders legend and complete long labels in the table", () => {
    render(
      <QuadrantScatterChart
        data={quadrantScatterEdgeCases.longLabel}
        animate={false}
      />,
    );
    expect(
      screen.getByRole("list", { name: "Quadrant scatter legend" }),
    ).toHaveTextContent("thresholds");
    expect(screen.getByRole("table")).toHaveTextContent(
      "North American enterprise platform accounts",
    );
  });
  it("honors reduced motion", () => {
    const match = vi
      .spyOn(window, "matchMedia")
      .mockReturnValue({
        matches: true,
        media: "",
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      });
    render(<QuadrantScatterChart />);
    expect(
      screen.getByRole("group", { name: "Quadrant scatter interactive chart" }),
    ).toHaveAttribute("data-quadrant-animation", "false");
    match.mockRestore();
  });
  it("passes axe and SSR", async () => {
    const { container } = render(<QuadrantScatterChart animate={false} />);
    expect(
      (
        await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
    expect(() =>
      renderToString(<QuadrantScatterChart animate={false} />),
    ).not.toThrow();
  });
});
