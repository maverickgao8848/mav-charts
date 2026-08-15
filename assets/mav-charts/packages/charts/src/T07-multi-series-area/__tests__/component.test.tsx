import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getVisualSystem } from "@mav-charts/themes";
import { MultiSeriesAreaChart, MultiSeriesAreaGeometry } from "../index";
import {
  multiSeriesAreaEdgeCases,
  multiSeriesAreaExample,
} from "../example-data";
describe("T07 component", () => {
  it("renders overlaid zero-base semantics and table", () => {
    const html = renderToStaticMarkup(
      <MultiSeriesAreaChart data={multiSeriesAreaExample} animate={false} />,
    );
    expect(html).toContain('data-chart-id="T07"');
    expect(html).toContain('data-base-value="0"');
    expect(html).toContain('data-stacking="overlaid-not-stacked"');
    expect(html).toContain("Multi-series area values");
  });
  it("exposes independent gap segments", () => {
    const html = renderToStaticMarkup(
      <MultiSeriesAreaGeometry
        data={multiSeriesAreaEdgeCases.missingPrimary}
        theme={getVisualSystem("signal")}
        animate={false}
      />,
    );
    expect(html).toContain('data-primary-segments="2"');
    expect(html).toContain('data-comparison-segments="1"');
    expect(html).toContain("Missing");
  });
  it("reports empty and invalid states", () => {
    expect(
      renderToStaticMarkup(<MultiSeriesAreaChart data={[]} animate={false} />),
    ).toContain('data-state="empty"');
    expect(
      renderToStaticMarkup(
        <MultiSeriesAreaChart
          data={multiSeriesAreaEdgeCases.invalid}
          animate={false}
        />,
      ),
    ).toContain('data-state="invalid"');
  });
});
