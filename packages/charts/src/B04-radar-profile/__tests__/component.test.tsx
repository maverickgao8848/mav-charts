import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getVisualSystem } from "@mav-charts/themes";
import { radarProfileEdgeCases, radarProfileExample } from "../example-data";
import { RadarProfileChart, RadarProfileGeometry } from "../index";
describe("B04 component", () => {
  it("renders fixed-domain semantics and table", () => {
    const html = renderToStaticMarkup(
      <RadarProfileChart data={radarProfileExample} animate={false} />,
    );
    expect(html).toContain('data-chart-id="B04"');
    expect(html).toContain('data-domain-min="0"');
    expect(html).toContain('data-domain-max="100"');
    expect(html).toContain("Normalized radar profile scores");
  });
  it("reports insufficient axes without a fake polygon", () => {
    const html = renderToStaticMarkup(
      <RadarProfileGeometry
        data={radarProfileEdgeCases.single}
        theme={getVisualSystem("signal")}
        animate={false}
      />,
    );
    expect(html).toContain('data-primary-complete="false"');
    expect(html).toContain("PROFILE UNAVAILABLE");
  });
  it("preserves missing profile values as missing metadata", () => {
    const html = renderToStaticMarkup(
      <RadarProfileGeometry
        data={radarProfileEdgeCases.missingPrimary}
        theme={getVisualSystem("signal")}
        animate={false}
      />,
    );
    expect(html).toContain('data-primary-missing="1"');
    expect(html).toContain("Missing");
  });
  it("reports empty and invalid", () => {
    expect(
      renderToStaticMarkup(<RadarProfileChart data={[]} animate={false} />),
    ).toContain('data-state="empty"');
    expect(
      renderToStaticMarkup(
        <RadarProfileChart
          data={radarProfileEdgeCases.over100}
          animate={false}
        />,
      ),
    ).toContain('data-state="invalid"');
  });
});
