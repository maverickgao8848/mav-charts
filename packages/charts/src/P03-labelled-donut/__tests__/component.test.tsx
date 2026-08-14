import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getVisualSystem } from "@mav-charts/themes";
import { labelledDonutEdgeCases, labelledDonutExample } from "../example-data";
import { LabelledDonutChart, LabelledDonutGeometry } from "../index";

describe("P03 component", () => {
  it("renders honest composition semantics, legend and table", () => {
    const html = renderToStaticMarkup(<LabelledDonutChart data={labelledDonutExample} animate={false} />);
    expect(html).toContain('data-chart-id="P03"');
    expect(html).toContain('data-total="100"');
    expect(html).toContain("Angle = value / reported total");
    expect(html).toContain("Labelled donut composition");
  });
  it("retains missing and zero rows without sectors", () => {
    const missing = renderToStaticMarkup(<LabelledDonutGeometry data={labelledDonutEdgeCases.missing} theme={getVisualSystem("signal")} animate={false} />), zero = renderToStaticMarkup(<LabelledDonutGeometry data={labelledDonutEdgeCases.zero} theme={getVisualSystem("signal")} animate={false} />);
    expect(missing).toContain('data-rendered-count="2"');
    expect(missing).toContain('data-missing-count="1"');
    expect(missing).toContain("Missing");
    expect(zero).toContain('data-zero-count="1"');
    expect(zero).toContain("Zero");
  });
  it("reports empty and invalid states", () => {
    expect(renderToStaticMarkup(<LabelledDonutChart data={[]} animate={false} />)).toContain('data-state="empty"');
    expect(renderToStaticMarkup(<LabelledDonutChart data={labelledDonutEdgeCases.negative} animate={false} />)).toContain('data-state="invalid"');
  });
});
