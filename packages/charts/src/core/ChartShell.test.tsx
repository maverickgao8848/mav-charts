import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import axe from "axe-core";
import { visualSystems } from "@mav-charts/themes";
import { ChartShell } from "./ChartShell";

describe("ChartShell", () => {
  it("exposes chart identity and visual system without changing semantics", () => {
    render(
      <ChartShell code="C10" title="Profit bridge" subtitle="Indexed" source="MAV" theme={visualSystems.signal}>
        <svg role="img" aria-label="Bridge geometry" />
      </ChartShell>,
    );
    const article = screen.getByRole("article", { name: "Profit bridge" });
    expect(article).toHaveAttribute("data-chart-id", "C10");
    expect(article).toHaveAttribute("data-visual-system", "signal");
    expect(screen.getByRole("img", { name: "Bridge geometry" })).toBeInTheDocument();
  });

  it("renders an explicit empty state", () => {
    render(
      <ChartShell code="T01" title="Trend" subtitle="Monthly" source="MAV" theme={visualSystems.digital} state="empty">
        <span>hidden</span>
      </ChartShell>,
    );
    expect(screen.getByRole("status")).toHaveTextContent("No data available");
    expect(screen.queryByText("hidden")).not.toBeInTheDocument();
  });

  it("has no baseline accessibility violations", async () => {
    const { container } = render(
      <ChartShell
        code="C10"
        title="Profit bridge"
        subtitle="Indexed"
        source="MAV"
        theme={visualSystems.signal}
        description="Profit increased from 78 to 84."
      >
        <svg role="img" aria-label="Profit bridge" />
      </ChartShell>,
    );
    const result = await axe.run(container, {
      rules: { "color-contrast": { enabled: false } },
    });
    expect(result.violations).toEqual([]);
  });
});
