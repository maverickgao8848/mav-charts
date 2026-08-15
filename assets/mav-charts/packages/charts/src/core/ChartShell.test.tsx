import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import axe from "axe-core";
import { visualSystems } from "@mav-charts/themes";
import { ChartShell } from "./ChartShell";

function PreviewGeometry({ data }: { data: readonly { label: string; detail?: string }[] }) {
  return <div aria-label="Simple columns interactive chart">{data.map((entry) => <span key={entry.label}>{entry.label} {entry.detail}</span>)}</div>;
}

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

  it("localizes the embedded Chinese preview without changing the default component API", async () => {
    window.history.replaceState({}, "", "/?lang=zh&chartTitle=%E5%88%86%E7%B1%BB%E5%AF%B9%E6%AF%94&chartSubtitle=%E5%9F%BA%E7%A1%80%E6%9F%B1%E7%8A%B6%E5%9B%BE&chartSource=%E4%BF%A1%E5%8F%B7");
    render(
      <ChartShell code="C01" title="English title" subtitle="English subtitle" source="SIGNAL" theme={visualSystems.signal}>
        <PreviewGeometry data={[{ label: "North", detail: "Largest region" }]} />
      </ChartShell>,
    );
    expect(screen.getByRole("article", { name: "分类对比" })).toBeInTheDocument();
    expect(screen.getByText("基础柱状图")).toBeInTheDocument();
    expect(screen.getByText("华北 当前最高")).toBeInTheDocument();
    await waitFor(() => expect(screen.getByLabelText("分类对比交互式图表")).toBeInTheDocument());
    window.history.replaceState({}, "", "/");
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
