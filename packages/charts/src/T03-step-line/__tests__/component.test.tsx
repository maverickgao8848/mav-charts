import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getVisualSystem } from "@mav-charts/themes";
import { StepLineChart, StepLineGeometry } from "../index";
import { stepLineEdgeCases, stepLineExample } from "../example-data";
describe("T03 component", () => {
  it("renders step semantics, legend, latest label contract and table", () => {
    const html = renderToStaticMarkup(
      <StepLineChart data={stepLineExample} animate={false} unit="%" />,
    );
    expect(html).toContain('data-chart-id="T03"');
    expect(html).toContain('data-step-after="true"');
    expect(html).toContain("stepAfter");
    expect(html).toContain("Step line values");
  });
  it("exposes shared semantic path and independent gap segments", () => {
    const html = renderToStaticMarkup(
      <StepLineGeometry
        data={stepLineEdgeCases.missing}
        theme={getVisualSystem("signal")}
        animate={false}
      />,
    );
    expect(html).toContain('data-step-segments="2"');
    expect(html).toContain("H100 V");
    expect(html).toContain("Missing");
  });
  it("reports empty and invalid states", () => {
    expect(
      renderToStaticMarkup(<StepLineChart data={[]} animate={false} />),
    ).toContain('data-state="empty"');
    expect(
      renderToStaticMarkup(
        <StepLineChart data={stepLineEdgeCases.invalid} animate={false} />,
      ),
    ).toContain('data-state="invalid"');
  });
});
