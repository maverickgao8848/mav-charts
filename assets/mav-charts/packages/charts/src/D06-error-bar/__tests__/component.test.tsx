import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ErrorBarChart, errorBarEdgeCases, errorBarExample } from "../index";
describe("D06 component", () => {
  it("renders ready, empty, and invalid states", () => {
    const { rerender } = render(
      <ErrorBarChart data={errorBarExample} animate={false} />,
    );
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    rerender(<ErrorBarChart data={[]} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(
      <ErrorBarChart data={errorBarEdgeCases.invalidOrder} animate={false} />,
    );
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-state",
      "invalid",
    );
  });
  it("retains missing whole marks and absolute bounds in the table", () => {
    render(<ErrorBarChart data={errorBarEdgeCases.missing} animate={false} />);
    const table = screen.getByRole("table");
    expect(table).toHaveTextContent("Pending");
    expect(table).toHaveTextContent("Missing");
    expect(table).toHaveTextContent("Absolute lower");
  });
  it("supports keyboard status with asymmetric distances", () => {
    render(
      <ErrorBarChart
        data={errorBarEdgeCases.asymmetric}
        animate={false}
        unit=" pts"
      />,
    );
    const group = screen.getByRole("group", {
      name: "Error bar interactive chart",
    });
    fireEvent.focus(group);
    expect(screen.getByRole("status")).toHaveTextContent("−30 pts / +8 pts");
    fireEvent.keyDown(group, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("−4 pts / +33 pts");
  });
  it("renders legend and full labels", () => {
    render(
      <ErrorBarChart data={errorBarEdgeCases.longLabel} animate={false} />,
    );
    expect(
      screen.getByRole("list", { name: "Error bar legend" }),
    ).toHaveTextContent("ABSOLUTE LOWER / UPPER");
    expect(screen.getByRole("table")).toHaveTextContent(
      "North American enterprise confidence interval",
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
    render(<ErrorBarChart />);
    expect(
      screen.getByRole("group", { name: "Error bar interactive chart" }),
    ).toHaveAttribute("data-error-animation", "false");
    match.mockRestore();
  });
  it("passes axe and SSR", async () => {
    const { container } = render(<ErrorBarChart animate={false} />);
    expect(
      (
        await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
    expect(() =>
      renderToString(<ErrorBarChart animate={false} />),
    ).not.toThrow();
  });
});
