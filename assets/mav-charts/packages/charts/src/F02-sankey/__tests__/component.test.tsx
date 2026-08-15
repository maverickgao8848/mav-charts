import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SankeyChart, resolveSankeyAnimation } from "../index";
import { sankeyEdgeCases, sankeyExample } from "../example-data";

describe("F02 Sankey component", () => {
  it("renders a ready chart and preserves every flow in the table", () => {
    const { container } = render(
      <SankeyChart data={sankeyExample} animate={false} />,
    );
    expect(container.querySelector('[data-chart-id="F02"]')).toHaveAttribute(
      "data-state",
      "ready",
    );
    expect(screen.getByRole("table")).toHaveTextContent("Inputs");
    expect(screen.getByRole("table")).toHaveTextContent("Customers");
  });
  it("retains null links as Missing in the table", () => {
    render(<SankeyChart data={sankeyEdgeCases.missing} animate={false} />);
    expect(screen.getByRole("table")).toHaveTextContent("Missing");
  });
  it("exposes empty and invalid states", () => {
    const { container, rerender } = render(
      <SankeyChart data={[]} animate={false} />,
    );
    expect(container.querySelector('[data-chart-id="F02"]')).toHaveAttribute(
      "data-state",
      "empty",
    );
    rerender(<SankeyChart data={sankeyEdgeCases.cycle} animate={false} />);
    expect(container.querySelector('[data-chart-id="F02"]')).toHaveAttribute(
      "data-state",
      "invalid",
    );
  });
  it("uses the same semantic geometry in all themes", () => {
    const { container, rerender } = render(
      <SankeyChart
        data={sankeyExample}
        visualSystem="signal"
        animate={false}
      />,
    );
    const rows = screen.getByRole("table").textContent;
    rerender(
      <SankeyChart
        data={sankeyExample}
        visualSystem="editorial"
        animate={false}
      />,
    );
    expect(screen.getByRole("table").textContent).toBe(rows);
    expect(container.querySelector('[data-chart-id="F02"]')).toBeTruthy();
  });
  it("resolves reduced motion unless explicitly overridden", () => {
    expect(resolveSankeyAnimation(undefined, true)).toBe(false);
    expect(resolveSankeyAnimation(undefined, false)).toBe(true);
    expect(resolveSankeyAnimation(true, true)).toBe(true);
  });
});
