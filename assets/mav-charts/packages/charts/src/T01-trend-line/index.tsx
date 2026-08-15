import { useState, type KeyboardEvent } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
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
import { trendLineExample } from "./example-data";
import { getTrendLineMotion } from "./motion";
import {
  buildTrendLineGeometry,
  getTrendLineDomain,
  validateTrendLineData,
  type TrendLineDatum,
  type TrendLineGeometryDatum,
} from "./schema";

export type TrendLineChartProps = {
  data?: readonly TrendLineDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  seriesName?: string;
  unit?: string;
};

export const formatTrendLineLabel = (label: string, maximum = 12) =>
  label.length > maximum
    ? `${label.slice(0, maximum - 1).trimEnd()}…`
    : label;

export const formatTrendLineValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000)
    return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  if (absolute >= 1_000_000)
    return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (absolute >= 1_000)
    return `${Number((value / 1_000).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};

export const resolveTrendLineAnimation = (
  animate: boolean | undefined,
  reducedMotion: boolean,
) => animate ?? !reducedMotion;

type DotProps = {
  cx?: number;
  cy?: number;
  payload?: TrendLineGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  unit?: string;
};

function TrendDot({ cx = 0, cy = 0, payload, theme, unit = "" }: DotProps) {
  if (!payload || payload.value === null) return null;
  return (
    <g>
      <circle
        data-trend-dot={payload.label}
        data-latest-valid={payload.latestValid ? "true" : "false"}
        cx={cx}
        cy={cy}
        r={payload.latestValid ? 4.5 : 3.5}
        fill={theme.primary}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="trend-line"
            attributeName="r"
            from="0"
            to={payload.latestValid ? "4.5" : "3.5"}
            dur="0.7s"
            fill="freeze"
          />
        ) : null}
      </circle>
      {payload.latestValid ? (
        <text
          data-trend-latest
          x={cx}
          y={cy - 13}
          textAnchor="middle"
          fill={theme.text}
          fontSize={theme.label.fontSize}
          fontWeight={theme.label.fontWeight}
        >
          LATEST {formatTrendLineValue(payload.value)}{unit}
        </text>
      ) : null}
    </g>
  );
}

function TrendTooltip({
  active,
  payload,
  theme,
  seriesName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: TrendLineGeometryDatum }[];
  theme: VisualSystemTokens;
  seriesName: string;
  unit: string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return (
    <div
      style={{
        padding: theme.tooltip.padding,
        border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
        borderRadius: theme.tooltip.radius,
        background: theme.surfaceAlt,
        color: theme.text,
        fontSize: theme.label.fontSize,
      }}
    >
      <strong>{datum.label}</strong>
      <div>
        {seriesName}: {datum.value === null ? "Missing" : `${formatTrendLineValue(datum.value)}${unit}`}
      </div>
      {datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}
    </div>
  );
}

export function TrendLineGeometry({
  data,
  theme,
  animate = true,
  seriesName = "Value",
  unit = "",
}: {
  data: readonly TrendLineDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  seriesName?: string;
  unit?: string;
}) {
  const geometry = buildTrendLineGeometry(data).map((datum) => ({
    ...datum,
    animate,
  }));
  const domain = getTrendLineDomain(data);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : geometry[activeIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!geometry.length || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setActiveIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.length - 1;
      const start = current ?? 0;
      return event.key === "ArrowRight"
        ? (start + 1) % geometry.length
        : (start - 1 + geometry.length) % geometry.length;
    });
  };

  return (
    <div
      role="group"
      aria-label="Trend line interactive chart"
      data-trend-animation={animate ? "true" : "false"}
      tabIndex={0}
      onFocus={() => setActiveIndex((current) => current ?? 0)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={onKeyDown}
      style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}
    >
      <div
        role="list"
        aria-label="Trend line legend"
        data-trend-legend
        style={{
          position: "absolute",
          zIndex: 2,
          top: 4,
          right: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <i aria-hidden="true" style={{ width: theme.legend.iconSize + 7, height: 2, background: theme.primary }} />
          {seriesName}
        </span>
        <span role="listitem">Missing = line break</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={geometry} margin={{ top: 42, right: 28, left: 0, bottom: 10 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
          <XAxis
            dataKey="label"
            interval={0}
            tickFormatter={(label) => formatTrendLineLabel(String(label))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[...domain]}
            tickFormatter={(value) => formatTrendLineValue(Number(value))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip
            cursor={{ stroke: theme.grid, strokeWidth: 1 }}
            content={({ active: tooltipActive, payload }) => (
              <TrendTooltip
                active={tooltipActive}
                payload={payload as unknown as readonly { payload?: TrendLineGeometryDatum }[]}
                theme={theme}
                seriesName={seriesName}
                unit={unit}
              />
            )}
          />
          <Line
            type="linear"
            dataKey="value"
            connectNulls={false}
            stroke={theme.primary}
            strokeWidth={theme.line.emphasis}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={(props: unknown) => (
              <TrendDot {...(props as Omit<DotProps, "theme" | "unit">)} theme={theme} unit={unit} />
            )}
            activeDot={{ r: 6, fill: theme.primary, stroke: theme.background }}
            {...getTrendLineMotion(theme.key, animate)}
          />
        </LineChart>
      </ResponsiveContainer>
      {active ? (
        <div
          role="status"
          style={{
            position: "absolute",
            zIndex: 3,
            right: 8,
            bottom: 4,
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.label}: {active.value === null ? "Missing; line breaks here" : `${seriesName} ${formatTrendLineValue(active.value)}${unit}`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Trend line values"
        rows={geometry}
        columns={[
          { key: "label", label: "Observation", value: (row) => row.label },
          { key: "value", label: seriesName, value: (row) => row.value ?? "Missing" },
          { key: "detail", label: "Detail", value: (row) => row.detail ?? "" },
        ]}
      />
    </div>
  );
}

export function TrendLineChart({
  data = trendLineExample,
  visualSystem = "signal",
  animate,
  title = "Momentum accelerated into Q4",
  subtitle = "ONE METRIC · EQUALLY SPACED OBSERVATIONS",
  seriesName = "Value",
  unit = "",
}: TrendLineChartProps) {
  const theme = getVisualSystem(visualSystem);
  const validation = validateTrendLineData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="T01"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · TREND LINE`}
      theme={theme}
      state={state}
      description="One ordered metric on equal categorical spacing; missing observations break the line."
    >
      <TrendLineGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveTrendLineAnimation(animate, usePrefersReducedMotion())}
        seriesName={seriesName}
        unit={unit}
      />
    </ChartShell>
  );
}

export {
  buildTrendLineGeometry,
  buildTrendLineSegments,
  getTrendLineDomain,
  mapTrendLineX,
  mapTrendLineY,
  validateTrendLineData,
} from "./schema";
export type { TrendLineDatum, TrendLineGeometryDatum, TrendLineSegment } from "./schema";
export { trendLineExample, trendLineEdgeCases } from "./example-data";
export { trendLineMetadata } from "./metadata";
