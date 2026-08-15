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
import { multiSeriesLineExample } from "./example-data";
import { getMultiSeriesLineMotion } from "./motion";
import {
  buildMultiSeriesLineGeometry,
  buildMultiSeriesLineSegments,
  getMultiSeriesLineDomain,
  validateMultiSeriesLineData,
  type MultiSeriesKey,
  type MultiSeriesLineDatum,
  type MultiSeriesLineGeometryDatum,
} from "./schema";

export type MultiSeriesLineChartProps = {
  data?: readonly MultiSeriesLineDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  primaryName?: string;
  comparisonName?: string;
  unit?: string;
};

export const formatMultiSeriesLineLabel = (label: string, maximum = 12) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatMultiSeriesLineValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000)
    return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  if (absolute >= 1_000_000)
    return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (absolute >= 1_000) return `${Number((value / 1_000).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const resolveMultiSeriesLineAnimation = (
  animate: boolean | undefined,
  reducedMotion: boolean,
) => animate ?? !reducedMotion;

type DotProps = {
  cx?: number;
  cy?: number;
  payload?: MultiSeriesLineGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  series: MultiSeriesKey;
  name: string;
  unit: string;
};

function MultiSeriesDot({
  cx = 0,
  cy = 0,
  payload,
  theme,
  series,
  name,
  unit,
}: DotProps) {
  if (!payload || payload[series] === null) return null;
  const latest =
    series === "value" ? payload.latestValue : payload.latestComparison;
  const dy =
    series === "value" ? payload.valueLabelDy : payload.comparisonLabelDy;
  const color = series === "value" ? theme.primary : theme.secondary;
  const radius = latest ? 4.5 : 3.5;
  return (
    <g>
      <circle
        data-multi-dot={payload.label}
        data-series={series}
        data-latest-valid={latest ? "true" : "false"}
        cx={cx}
        cy={cy}
        r={radius}
        fill={color}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="multi-series-line"
            attributeName="r"
            from="0"
            to={String(radius)}
            dur="0.7s"
            fill="freeze"
          />
        ) : null}
      </circle>
      {latest ? (
        <text
          data-multi-latest={series}
          x={cx - 7}
          y={cy + dy}
          textAnchor="end"
          fill={color}
          fontSize={theme.label.fontSize}
          fontWeight={theme.label.fontWeight}
        >
          {name.toUpperCase()} {formatMultiSeriesLineValue(payload[series])}
          {unit}
        </text>
      ) : null}
    </g>
  );
}

function MultiSeriesTooltip({
  active,
  payload,
  theme,
  primaryName,
  comparisonName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: MultiSeriesLineGeometryDatum }[];
  theme: VisualSystemTokens;
  primaryName: string;
  comparisonName: string;
  unit: string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  const format = (value: number | null) =>
    value === null ? "Missing" : `${formatMultiSeriesLineValue(value)}${unit}`;
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
        {primaryName}: {format(datum.value)}
      </div>
      <div>
        {comparisonName}: {format(datum.comparison)}
      </div>
      {datum.detail ? (
        <small style={{ color: theme.muted }}>{datum.detail}</small>
      ) : null}
    </div>
  );
}

export function MultiSeriesLineGeometry({
  data,
  theme,
  animate = true,
  primaryName = "Current",
  comparisonName = "Prior",
  unit = "",
}: {
  data: readonly MultiSeriesLineDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  primaryName?: string;
  comparisonName?: string;
  unit?: string;
}) {
  const geometry = buildMultiSeriesLineGeometry(data).map((datum) => ({
    ...datum,
    animate,
  }));
  const domain = getMultiSeriesLineDomain(data);
  const primarySegments = buildMultiSeriesLineSegments(data, "value").length;
  const comparisonSegments = buildMultiSeriesLineSegments(
    data,
    "comparison",
  ).length;
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : geometry[activeIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !geometry.length ||
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    )
      return;
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
  const format = (value: number | null) =>
    value === null
      ? "Missing; line breaks here"
      : `${formatMultiSeriesLineValue(value)}${unit}`;
  return (
    <div
      role="group"
      aria-label="Multi-series line interactive chart"
      data-multi-animation={animate ? "true" : "false"}
      data-domain-min={domain[0]}
      data-domain-max={domain[1]}
      data-primary-segments={primarySegments}
      data-comparison-segments={comparisonSegments}
      tabIndex={0}
      onFocus={() => setActiveIndex((current) => current ?? 0)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={onKeyDown}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        outline: "none",
      }}
    >
      <div
        role="list"
        aria-label="Multi-series line legend"
        data-multi-legend
        style={{
          position: "absolute",
          zIndex: 2,
          top: 24,
          right: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span
          role="listitem"
          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <i
            aria-hidden="true"
            style={{
              width: theme.legend.iconSize + 7,
              height: 3,
              background: theme.primary,
            }}
          />
          {primaryName}
        </span>
        <span
          role="listitem"
          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <i
            aria-hidden="true"
            style={{
              width: theme.legend.iconSize + 7,
              height: 2,
              background: theme.secondary,
            }}
          />
          {comparisonName}
        </span>
        <span role="listitem">Missing = independent break</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={geometry}
          margin={{ top: 68, right: 48, left: 0, bottom: 10 }}
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
            tickFormatter={(label) => formatMultiSeriesLineLabel(String(label))}
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
            tickFormatter={(value) => formatMultiSeriesLineValue(Number(value))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip
            cursor={{ stroke: theme.grid, strokeWidth: 1 }}
            content={({ active: tooltipActive, payload }) => (
              <MultiSeriesTooltip
                active={tooltipActive}
                payload={
                  payload as unknown as readonly {
                    payload?: MultiSeriesLineGeometryDatum;
                  }[]
                }
                theme={theme}
                primaryName={primaryName}
                comparisonName={comparisonName}
                unit={unit}
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
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={(props: unknown) => (
              <MultiSeriesDot
                {...(props as Omit<
                  DotProps,
                  "theme" | "series" | "name" | "unit"
                >)}
                theme={theme}
                series="value"
                name={primaryName}
                unit={unit}
              />
            )}
            activeDot={{ r: 6, fill: theme.primary, stroke: theme.background }}
            {...getMultiSeriesLineMotion(theme.key, animate)}
          />
          <Line
            name={comparisonName}
            type="linear"
            dataKey="comparison"
            connectNulls={false}
            stroke={theme.secondary}
            strokeWidth={theme.line.data}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={(props: unknown) => (
              <MultiSeriesDot
                {...(props as Omit<
                  DotProps,
                  "theme" | "series" | "name" | "unit"
                >)}
                theme={theme}
                series="comparison"
                name={comparisonName}
                unit={unit}
              />
            )}
            activeDot={{
              r: 5,
              fill: theme.secondary,
              stroke: theme.background,
            }}
            {...getMultiSeriesLineMotion(theme.key, animate)}
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
          {active.label}: {primaryName} {format(active.value)}; {comparisonName}{" "}
          {format(active.comparison)}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Multi-series line values"
        rows={geometry}
        columns={[
          { key: "label", label: "Observation", value: (row) => row.label },
          {
            key: "value",
            label: `${primaryName}${unit ? ` (${unit})` : ""}`,
            value: (row) => row.value ?? "Missing",
          },
          {
            key: "comparison",
            label: `${comparisonName}${unit ? ` (${unit})` : ""}`,
            value: (row) => row.comparison ?? "Missing",
          },
          { key: "detail", label: "Detail", value: (row) => row.detail ?? "" },
        ]}
      />
    </div>
  );
}

export function MultiSeriesLineChart({
  data = multiSeriesLineExample,
  visualSystem = "signal",
  animate,
  title = "Current momentum is outpacing prior performance",
  subtitle = "TWO SERIES · SAME UNIT · EQUAL SPACING",
  primaryName = "Current",
  comparisonName = "Prior",
  unit = "",
}: MultiSeriesLineChartProps) {
  const theme = getVisualSystem(visualSystem);
  const validation = validateMultiSeriesLineData(data);
  const state =
    data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="T02"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · MULTI-SERIES LINE`}
      theme={theme}
      state={state}
      description="Two same-unit ordered trends on equal categorical spacing; each missing series breaks independently."
    >
      <MultiSeriesLineGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveMultiSeriesLineAnimation(
          animate,
          usePrefersReducedMotion(),
        )}
        primaryName={primaryName}
        comparisonName={comparisonName}
        unit={unit}
      />
    </ChartShell>
  );
}

export {
  buildMultiSeriesLineGeometry,
  buildMultiSeriesLineSegments,
  getMultiSeriesLineDomain,
  mapMultiSeriesLineX,
  mapMultiSeriesLineY,
  validateMultiSeriesLineData,
} from "./schema";
export type {
  MultiSeriesKey,
  MultiSeriesLineDatum,
  MultiSeriesLineGeometryDatum,
  MultiSeriesLineSegment,
} from "./schema";
export {
  multiSeriesLineExample,
  multiSeriesLineEdgeCases,
} from "./example-data";
export { multiSeriesLineMetadata } from "./metadata";
