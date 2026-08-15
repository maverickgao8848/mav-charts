import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getVisualSystem } from "@mav-charts/themes";
import { treemapEdgeCases, treemapExample } from "../example-data";
import { TreemapChart, TreemapGeometry } from "../index";

describe("F01 component", () => {
  it("renders semantics, legend and accessible table", () => {
    const html = renderToStaticMarkup(<TreemapChart data={treemapExample} animate={false} />);
    expect(html).toContain('data-chart-id="F01"');
    expect(html).toContain('data-total="100"');
    expect(html).toContain("Area = value / reported total");
    expect(html).toContain("Treemap categories");
  });
  it("preserves zero and missing rows without tiles", () => {
    const html = renderToStaticMarkup(<TreemapGeometry data={treemapEdgeCases.missing} theme={getVisualSystem("signal")} animate={false} />);
    expect(html).toContain('data-rendered-count="2"');
    expect(html).toContain('data-missing-count="1"');
    expect(html).toContain("Missing");
  });
  it("reports empty and invalid states", () => {
    expect(renderToStaticMarkup(<TreemapChart data={[]} animate={false} />)).toContain('data-state="empty"');
    expect(renderToStaticMarkup(<TreemapChart data={treemapEdgeCases.negative} animate={false} />)).toContain('data-state="invalid"');
  });
});
