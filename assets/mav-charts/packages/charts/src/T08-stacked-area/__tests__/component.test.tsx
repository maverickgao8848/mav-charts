import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getVisualSystem } from "@mav-charts/themes";
import { StackedAreaChart, StackedAreaGeometry } from "../index";
import { stackedAreaEdgeCases, stackedAreaExample } from "../example-data";
describe("T08 component", () => {
  it("renders absolute non-normalized stack semantics and table", () => {
    const html = renderToStaticMarkup(
      <StackedAreaChart data={stackedAreaExample} animate={false} />,
    );
    expect(html).toContain('data-chart-id="T08"');
    expect(html).toContain('data-stack-id="absolute-total"');
    expect(html).toContain('data-normalized="false"');
    expect(html).toContain("Stacked area absolute values");
  });
  it("renders either missing part as a shared gap", () => {
    const html = renderToStaticMarkup(
      <StackedAreaGeometry
        data={stackedAreaEdgeCases.missingValue}
        theme={getVisualSystem("signal")}
        animate={false}
      />,
    );
    expect(html).toContain('data-complete-segments="2"');
    expect(html).toContain("Missing whole total");
  });
  it("reports empty and invalid", () => {
    expect(
      renderToStaticMarkup(<StackedAreaChart data={[]} animate={false} />),
    ).toContain('data-state="empty"');
    expect(
      renderToStaticMarkup(
        <StackedAreaChart
          data={stackedAreaEdgeCases.invalidNegative}
          animate={false}
        />,
      ),
    ).toContain('data-state="invalid"');
  });
});
