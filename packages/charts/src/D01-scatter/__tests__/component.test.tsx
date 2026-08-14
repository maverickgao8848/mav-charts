import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getVisualSystem } from "@mav-charts/themes";
import { ScatterChartTemplate, ScatterGeometry } from "../index";
import { scatterEdgeCases, scatterExample } from "../example-data";
describe("D01 component", () => {
  it("renders geometry legend and table", () => {
    const html = renderToStaticMarkup(
      <ScatterChartTemplate data={scatterExample} animate={false} />,
    );
    expect(html).toContain('data-chart-id="D01"');
    expect(html).toContain('data-plotted-count="4"');
    expect(html).toContain("Scatter coordinates");
  });
  it("keeps missing rows without marks", () => {
    const html = renderToStaticMarkup(
      <ScatterGeometry
        data={scatterEdgeCases.missing}
        theme={getVisualSystem("signal")}
        animate={false}
      />,
    );
    expect(html).toContain('data-plotted-count="2"');
    expect(html).toContain('data-missing-count="2"');
    expect(html).toContain("Missing point");
  });
  it("reports empty and invalid states", () => {
    expect(
      renderToStaticMarkup(<ScatterChartTemplate data={[]} animate={false} />),
    ).toContain('data-state="empty"');
    expect(
      renderToStaticMarkup(
        <ScatterChartTemplate
          data={scatterEdgeCases.invalid}
          animate={false}
        />,
      ),
    ).toContain('data-state="invalid"');
  });
});
