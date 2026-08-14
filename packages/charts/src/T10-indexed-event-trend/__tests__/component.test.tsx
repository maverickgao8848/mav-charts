import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { getVisualSystem } from "@mav-charts/themes";
import { IndexedEventTrendChart, IndexedEventTrendGeometry } from "../index";
import { indexedEventEdgeCases, indexedEventExample } from "../example-data";
describe("T10 component", () => {
  it("renders baseline, events, lines, legend, and table", () => {
    const html = renderToStaticMarkup(
      <IndexedEventTrendChart data={indexedEventExample} animate={false} />,
    );
    expect(html).toContain('data-chart-id="T10"');
    expect(html).toContain('data-baseline="100"');
    expect(html).toContain('data-event-count="1"');
    expect(html).toContain("Indexed event trend values");
  });
  it("exposes independent gap segments and multiple events", () => {
    const gaps = renderToStaticMarkup(
      <IndexedEventTrendGeometry
        data={indexedEventEdgeCases.missingPrimary}
        theme={getVisualSystem("signal")}
        animate={false}
      />,
    );
    expect(gaps).toContain('data-primary-segments="2"');
    expect(gaps).toContain('data-comparison-segments="1"');
    const events = renderToStaticMarkup(
      <IndexedEventTrendGeometry
        data={indexedEventEdgeCases.multipleEvents}
        theme={getVisualSystem("signal")}
        animate={false}
      />,
    );
    expect(events).toContain('data-event-count="3"');
  });
  it("reports empty and invalid states", () => {
    expect(
      renderToStaticMarkup(
        <IndexedEventTrendChart data={[]} animate={false} />,
      ),
    ).toContain('data-state="empty"');
    expect(
      renderToStaticMarkup(
        <IndexedEventTrendChart
          data={indexedEventEdgeCases.invalid}
          animate={false}
        />,
      ),
    ).toContain('data-state="invalid"');
  });
});
