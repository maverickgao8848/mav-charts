import { useState, type KeyboardEvent } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getVisualSystem,
  type VisualSystemId,
  type VisualSystemTokens,
} from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { indexedEventExample } from "./example-data";
import { getIndexedEventMotion } from "./motion";
import {
  buildIndexedEventGeometry,
  buildIndexedEventSegments,
  getIndexedEventDomain,
  getIndexedEventMarkers,
  validateIndexedEventData,
  type IndexedEventDatum,
  type IndexedEventGeometryDatum,
  type IndexedSeriesKey,
} from "./schema";

export type IndexedEventTrendChartProps = {
  data?: readonly IndexedEventDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  primaryName?: string;
  comparisonName?: string;
  unit?: string;
};
export const formatIndexedEventValue = (value: number) => {
  const a = Math.abs(value);
  if (a >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (a >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(2)).toString();
};
export const formatIndexedEventLabel = (label: string, maximum = 12) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const resolveIndexedEventAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;

export const describeIndexedBaseline = (value: number) =>
  value === 100
    ? "at baseline"
    : `${value > 100 ? "above" : "below"} baseline by ${formatIndexedEventValue(Math.abs(value - 100))}`;

type DotProps = {
  cx?: number;
  cy?: number;
  payload?: IndexedEventGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  series: IndexedSeriesKey;
  name: string;
};
function IndexedDot({
  cx = 0,
  cy = 0,
  payload,
  theme,
  series,
  name,
}: DotProps) {
  if (!payload || payload[series] === null) return null;
  const latest =
    series === "value" ? payload.latestValue : payload.latestComparison;
  const dy =
    series === "value" ? payload.valueLabelDy : payload.comparisonLabelDy;
  const color = series === "value" ? theme.primary : theme.secondary;
  return (
    <g>
      <circle
        data-indexed-dot={payload.label}
        data-series={series}
        cx={cx}
        cy={cy}
        r={latest ? 4.5 : 3.5}
        fill={color}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="indexed-event"
            attributeName="r"
            from="0"
            to={latest ? "4.5" : "3.5"}
            dur="0.7s"
            fill="freeze"
          />
        ) : null}
      </circle>
      {latest ? (
        <text
          data-indexed-latest={series}
          x={cx - 7}
          y={cy + dy}
          textAnchor="end"
          fill={color}
          fontSize={theme.label.fontSize}
          fontWeight={theme.label.fontWeight}
        >
          {name.toUpperCase()} {formatIndexedEventValue(payload[series]!)}
        </text>
      ) : null}
    </g>
  );
}

function IndexedTooltip({
  active,
  payload,
  theme,
  primaryName,
  comparisonName,
}: {
  active?: boolean;
  payload?: readonly { payload?: IndexedEventGeometryDatum }[];
  theme: VisualSystemTokens;
  primaryName: string;
  comparisonName: string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  const line = (value: number | null) =>
    value === null
      ? "Missing"
      : `${formatIndexedEventValue(value)} (${value >= 100 ? "+" : ""}${formatIndexedEventValue(value - 100)} vs 100)`;
  return (
    <div
      style={{
        padding: theme.tooltip.padding,
        border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
        background: theme.surfaceAlt,
        color: theme.text,
        fontSize: theme.label.fontSize,
      }}
    >
      <strong>{datum.label}</strong>
      <div>
        {primaryName}: {line(datum.value)}
      </div>
      <div>
        {comparisonName}: {line(datum.comparison)}
      </div>
      {datum.eventLabel ? <div>Event: {datum.eventLabel}</div> : null}
    </div>
  );
}

function EventAnnotation({
  viewBox,
  label,
  color,
  lane,
  anchor,
}: {
  viewBox?: { x?: number; y?: number };
  label: string;
  color: string;
  lane: number;
  anchor: "start" | "end";
}) {
  const x = (viewBox?.x ?? 0) + (anchor === "start" ? 6 : -6);
  const y = (viewBox?.y ?? 0) + 13 + lane * 15;
  return (
    <text
      data-event-label={label}
      x={x}
      y={y}
      textAnchor={anchor}
      fill={color}
      fontSize={10}
      fontWeight={800}
    >
      {formatIndexedEventLabel(label, 15)}
    </text>
  );
}

export function IndexedEventTrendGeometry({
  data,
  theme,
  animate = true,
  primaryName = "Primary index",
  comparisonName = "Comparison index",
}: {
  data: readonly IndexedEventDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  primaryName?: string;
  comparisonName?: string;
}) {
  const geometry = buildIndexedEventGeometry(data).map((d) => ({
      ...d,
      animate,
    })),
    domain = getIndexedEventDomain(data),
    markers = getIndexedEventMarkers(data);
  const primarySegments = buildIndexedEventSegments(data, "value").length,
    comparisonSegments = buildIndexedEventSegments(data, "comparison").length;
  const [activeIndex, setActiveIndex] = useState<number | null>(null),
    active = activeIndex === null ? null : geometry[activeIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !geometry.length ||
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    setActiveIndex((current) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? geometry.length - 1
          : event.key === "ArrowRight"
            ? ((current ?? 0) + 1) % geometry.length
            : ((current ?? 0) - 1 + geometry.length) % geometry.length,
    );
  };
  const describe = (value: number | null) =>
    value === null
      ? "Missing; line breaks here"
      : `${formatIndexedEventValue(value)}; ${describeIndexedBaseline(value)}`;
  return (
    <div
      role="group"
      aria-label="Indexed event trend interactive chart"
      tabIndex={0}
      onFocus={() => setActiveIndex((i) => i ?? 0)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={onKeyDown}
      data-indexed-animation={animate ? "true" : "false"}
      data-domain-min={domain[0]}
      data-domain-max={domain[1]}
      data-baseline="100"
      data-event-count={markers.length}
      data-primary-segments={primarySegments}
      data-comparison-segments={comparisonSegments}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        outline: "none",
      }}
    >
      <div
        role="list"
        aria-label="Indexed event trend legend"
        data-indexed-legend
        style={{
          position: "absolute",
          zIndex: 3,
          top: 24,
          right: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span role="listitem">
          ━ <b style={{ color: theme.primary }}>{primaryName}</b>
        </span>
        <span role="listitem">
          ━ <b style={{ color: theme.secondary }}>{comparisonName}</b>
        </span>
        <span role="listitem">BASELINE 100</span>
        <span role="listitem">EVENT MARKER</span>
        <span role="listitem">Missing = independent break</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={geometry}
          margin={{ top: 78, right: 58, left: 0, bottom: 12 }}
          accessibilityLayer
        >
          <CartesianGrid
            vertical={false}
            stroke={theme.grid}
            strokeDasharray={theme.chart.gridDash}
          />
          <XAxis
            dataKey="label"
            interval={0}
            tickFormatter={(value) => formatIndexedEventLabel(String(value))}
            tick={{
              fill: theme.muted,
              fontSize: theme.label.fontSize,
              fontWeight: theme.label.fontWeight,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[...domain]}
            tickFormatter={(value) => formatIndexedEventValue(Number(value))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={58}
          />
          <ReferenceLine
            y={100}
            stroke={theme.grid}
            strokeWidth={2}
            strokeDasharray="5 5"
            label={{
              value: "BASELINE 100",
              position: "insideBottomLeft",
              fill: theme.muted,
              fontSize: theme.label.fontSize,
            }}
          />
          {markers.map((marker, i) => (
            <ReferenceLine
              key={`${marker.category}-${i}`}
              x={marker.category}
              data-indexed-event={marker.label}
              stroke={i === 0 ? theme.primary : theme.secondary}
              strokeWidth={2}
              strokeOpacity={0.8}
              label={
                <EventAnnotation
                  label={marker.label}
                  color={i === 0 ? theme.primary : theme.secondary}
                  lane={i}
                  anchor={
                    marker.index < (data.length - 1) / 2 ? "start" : "end"
                  }
                />
              }
            />
          ))}
          <Tooltip
            cursor={{ stroke: theme.grid }}
            content={({ active, payload }) => (
              <IndexedTooltip
                active={active}
                payload={
                  payload as unknown as readonly {
                    payload?: IndexedEventGeometryDatum;
                  }[]
                }
                theme={theme}
                primaryName={primaryName}
                comparisonName={comparisonName}
              />
            )}
          />
          <Line
            name={primaryName}
            type="linear"
            dataKey="value"
            connectNulls={false}
            stroke={theme.primary}
            strokeWidth={theme.line.emphasis}
            dot={(p: unknown) => (
              <IndexedDot
                {...(p as Omit<DotProps, "theme" | "series" | "name">)}
                theme={theme}
                series="value"
                name={primaryName}
              />
            )}
            activeDot={{ r: 6, fill: theme.primary, stroke: theme.background }}
            {...getIndexedEventMotion(theme.key, animate)}
          />
          <Line
            name={comparisonName}
            type="linear"
            dataKey="comparison"
            connectNulls={false}
            stroke={theme.secondary}
            strokeWidth={theme.line.data}
            strokeDasharray="8 7"
            dot={(p: unknown) => (
              <IndexedDot
                {...(p as Omit<DotProps, "theme" | "series" | "name">)}
                theme={theme}
                series="comparison"
                name={comparisonName}
              />
            )}
            activeDot={{
              r: 5,
              fill: theme.secondary,
              stroke: theme.background,
            }}
            {...getIndexedEventMotion(theme.key, animate)}
          />
        </LineChart>
      </ResponsiveContainer>
      {active ? (
        <div
          role="status"
          style={{
            position: "absolute",
            right: 8,
            bottom: 4,
            zIndex: 4,
            padding: theme.tooltip.padding,
            border: `1px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.label}: {primaryName} {describe(active.value)};{" "}
          {comparisonName} {describe(active.comparison)}
          {active.eventLabel ? `; event ${active.eventLabel}` : ""}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Indexed event trend values"
        rows={geometry}
        columns={[
          { key: "label", label: "Observation", value: (row) => row.label },
          {
            key: "value",
            label: primaryName,
            value: (row) => row.value ?? "Missing",
          },
          {
            key: "comparison",
            label: comparisonName,
            value: (row) => row.comparison ?? "Missing",
          },
          {
            key: "event",
            label: "Event",
            value: (row) => row.eventLabel ?? "",
          },
          {
            key: "relative",
            label: "Relative to baseline 100",
            value: (row) =>
              `${row.value === null ? "Missing" : row.value - 100} / ${row.comparison === null ? "Missing" : row.comparison - 100}`,
          },
        ]}
      />
    </div>
  );
}

export function IndexedEventTrendChart({
  data = indexedEventExample,
  visualSystem = "signal",
  animate,
  title = "The event widened indexed momentum",
  subtitle = "TWO INDEXED SERIES · BASELINE 100 · EVENT WINDOWS",
  primaryName = "Primary index",
  comparisonName = "Comparison index",
}: IndexedEventTrendChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateIndexedEventData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="T10"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · INDEXED EVENT TREND`}
      theme={theme}
      state={state}
      description="Caller-indexed same-unit trends around one or more events; baseline 100 is preserved."
    >
      <IndexedEventTrendGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveIndexedEventAnimation(
          animate,
          usePrefersReducedMotion(),
        )}
        primaryName={primaryName}
        comparisonName={comparisonName}
      />
    </ChartShell>
  );
}
export {
  buildIndexedEventGeometry,
  buildIndexedEventSegments,
  getIndexedEventDomain,
  getIndexedEventMarkers,
  mapIndexedEventX,
  mapIndexedEventY,
  validateIndexedEventData,
} from "./schema";
export type {
  IndexedEventDatum,
  IndexedEventGeometryDatum,
  IndexedEventMarker,
  IndexedSeriesKey,
} from "./schema";
export { indexedEventExample, indexedEventEdgeCases } from "./example-data";
export { indexedEventMetadata } from "./metadata";
