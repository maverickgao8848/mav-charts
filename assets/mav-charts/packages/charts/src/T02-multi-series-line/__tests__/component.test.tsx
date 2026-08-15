import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getVisualSystem } from "@mav-charts/themes";
import { MultiSeriesLineChart, MultiSeriesLineGeometry } from "../index";
import {
  multiSeriesLineEdgeCases,
  multiSeriesLineExample,
} from "../example-data";
describe("T02 component", () => {
  it("renders both same-unit series, legend, labels and table", () => {
    const html = renderToStaticMarkup(
      <MultiSeriesLineChart
        data={multiSeriesLineExample}
        animate={false}
        unit="%"
      />,
    );
    expect(html).toContain('data-chart-id="T02"');
    expect(html).toContain("Current");
    expect(html).toContain("Prior");
    expect(html).toContain("Multi-series line values");
    expect(html).toContain('data-primary-segments="1"');
  });
  it("exposes independent gap geometry", () => {
    const html = renderToStaticMarkup(
      <MultiSeriesLineGeometry
        data={multiSeriesLineEdgeCases.missingPrimary}
        theme={getVisualSystem("signal")}
        animate={false}
      />,
    );
    expect(html).toContain('data-primary-segments="2"');
    expect(html).toContain('data-comparison-segments="1"');
    expect(html).toContain("Missing");
  });
  it("reports invalid and empty states without plotting invalid values", () => {
    expect(
      renderToStaticMarkup(
        <MultiSeriesLineChart
          data={multiSeriesLineEdgeCases.invalid}
          animate={false}
        />,
      ),
    ).toContain('data-state="invalid"');
    expect(
      renderToStaticMarkup(<MultiSeriesLineChart data={[]} animate={false} />),
    ).toContain('data-state="empty"');
  });
});
