import axe from "axe-core";
import { fireEvent, render, screen } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DonutChart } from "../index";
import { donutEdgeCases, donutExample } from "../example-data";
describe("P02 component", () => {
  it("renders true total, legend and table", () => {
    render(<DonutChart data={donutExample} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "ready");
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByRole("table")).toHaveTextContent("73.0%");
  });
  it("preserves missing and zero semantics", () => {
    const { rerender } = render(
      <DonutChart data={donutEdgeCases.missing} animate={false} />,
    );
    expect(screen.getByRole("table")).toHaveTextContent(
      "Awaiting reportMissingMissing",
    );
    rerender(<DonutChart data={donutEdgeCases.allZero} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-state",
      "invalid",
    );
    expect(screen.getByText("The supplied data is invalid")).toBeVisible();
  });
  it("supports keyboard status", () => {
    render(<DonutChart data={donutExample} animate={false} />);
    const group = screen.getByRole("group", {
      name: "Donut interactive chart",
    });
    fireEvent.focus(group);
    expect(screen.getByRole("status")).toHaveTextContent(
      "Enterprise: 73; 73.0%",
    );
    fireEvent.keyDown(group, { key: "End" });
    expect(screen.getByRole("status")).toHaveTextContent("Self-serve: 9; 9.0%");
  });
  it("reports empty/invalid and supports SSR/axe", async () => {
    const { rerender, container } = render(
      <DonutChart data={[]} animate={false} />,
    );
    expect(screen.getByRole("article")).toHaveAttribute("data-state", "empty");
    rerender(<DonutChart data={donutEdgeCases.negative} animate={false} />);
    expect(screen.getByRole("article")).toHaveAttribute(
      "data-state",
      "invalid",
    );
    expect(() => renderToString(<DonutChart animate={false} />)).not.toThrow();
    expect(
      (
        await axe.run(container, {
          rules: { "color-contrast": { enabled: false } },
        })
      ).violations,
    ).toEqual([]);
  });
});
