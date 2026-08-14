import { useState, type KeyboardEvent } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
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
import { multiSeriesAreaExample } from "./example-data";
import { getMultiSeriesAreaMotion } from "./motion";
import {
  buildMultiSeriesAreaGeometry,
  buildMultiSeriesAreaSegments,
  getMultiSeriesAreaDomain,
  validateMultiSeriesAreaData,
  type MultiSeriesAreaDatum,
  type MultiSeriesAreaGeometryDatum,
  type MultiSeriesAreaKey,
} from "./schema";
export type MultiSeriesAreaChartProps = {
  data?: readonly MultiSeriesAreaDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  primaryName?: string;
  comparisonName?: string;
  unit?: string;
};
export const formatMultiSeriesAreaLabel = (label: string, maximum = 12) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatMultiSeriesAreaValue = (value: number) => {
  const a = Math.abs(value);
  if (a >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (a >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const resolveMultiSeriesAreaAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
type DotProps = {
  cx?: number;
  cy?: number;
  payload?: MultiSeriesAreaGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  series: MultiSeriesAreaKey;
  name: string;
  unit: string;
};
function AreaDot({
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
      series === "value" ? payload.latestValue : payload.latestComparison,
    dy = series === "value" ? payload.valueLabelDy : payload.comparisonLabelDy,
    color = series === "value" ? theme.primary : theme.secondary,
    r = latest ? 4.5 : 3.5;
  return (
    <g>
      <circle
        data-area-dot={payload.label}
        data-series={series}
        cx={cx}
        cy={cy}
        r={r}
        fill={color}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="multi-series-area"
            attributeName="r"
            from="0"
            to={String(r)}
            dur="0.7s"
            fill="freeze"
          />
        ) : null}
      </circle>
      {latest ? (
        <text
          data-area-latest={series}
          x={cx - 7}
          y={cy + dy}
          textAnchor="end"
          fill={color}
          fontSize={theme.label.fontSize}
          fontWeight={theme.label.fontWeight}
        >
          {name.toUpperCase()} {formatMultiSeriesAreaValue(payload[series])}
          {unit}
        </text>
      ) : null}
    </g>
  );
}
function AreaTooltip({
  active,
  payload,
  theme,
  primaryName,
  comparisonName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: MultiSeriesAreaGeometryDatum }[];
  theme: VisualSystemTokens;
  primaryName: string;
  comparisonName: string;
  unit: string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  const f = (v: number | null) =>
    v === null ? "Missing" : `${formatMultiSeriesAreaValue(v)}${unit}`;
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
        {primaryName}: {f(datum.value)}
      </div>
      <div>
        {comparisonName}: {f(datum.comparison)}
      </div>
      <small style={{ color: theme.muted }}>
        Overlaid from zero; not stacked
      </small>
    </div>
  );
}
export function MultiSeriesAreaGeometry({
  data,
  theme,
  animate = true,
  primaryName = "Current",
  comparisonName = "Prior",
  unit = "",
}: {
  data: readonly MultiSeriesAreaDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  primaryName?: string;
  comparisonName?: string;
  unit?: string;
}) {
  const geometry = buildMultiSeriesAreaGeometry(data).map((d) => ({
      ...d,
      animate,
    })),
    domain = getMultiSeriesAreaDomain(data),
    pSegments = buildMultiSeriesAreaSegments(data, "value").length,
    cSegments = buildMultiSeriesAreaSegments(data, "comparison").length;
  const [activeIndex, setActiveIndex] = useState<number | null>(null),
    active = activeIndex === null ? null : geometry[activeIndex];
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
  const f = (v: number | null) =>
    v === null
      ? "Missing; area breaks here"
      : `${formatMultiSeriesAreaValue(v)}${unit}`;
  return (
    <div
      role="group"
      aria-label="Multi-series area interactive chart"
      data-area-animation={animate ? "true" : "false"}
      data-base-value="0"
      data-stacking="overlaid-not-stacked"
      data-primary-segments={pSegments}
      data-comparison-segments={cSegments}
      data-domain-min={domain[0]}
      data-domain-max={domain[1]}
      tabIndex={0}
      onFocus={() => setActiveIndex((c) => c ?? 0)}
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
        aria-label="Multi-series area legend"
        data-area-legend
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
        <span role="listitem">OVERLAID · NOT STACKED · BASE 0</span>
        <span role="listitem">Missing = independent break</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
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
            tickFormatter={(label) => formatMultiSeriesAreaLabel(String(label))}
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
            tickFormatter={(v) => formatMultiSeriesAreaValue(Number(v))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip
            cursor={{ stroke: theme.grid, strokeWidth: 1 }}
            content={({ active: ta, payload }) => (
              <AreaTooltip
                active={ta}
                payload={
                  payload as unknown as readonly {
                    payload?: MultiSeriesAreaGeometryDatum;
                  }[]
                }
                theme={theme}
                primaryName={primaryName}
                comparisonName={comparisonName}
                unit={unit}
              />
            )}
          />
          <Area
            name={comparisonName}
            type="linear"
            dataKey="comparison"
            baseValue={0}
            connectNulls={false}
            stroke={theme.secondary}
            strokeWidth={theme.line.data}
            fill={theme.secondary}
            fillOpacity={0.13}
            dot={(props: unknown) => (
              <AreaDot
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
            {...getMultiSeriesAreaMotion(theme.key, animate)}
          />
          <Area
            name={primaryName}
            type="linear"
            dataKey="value"
            baseValue={0}
            connectNulls={false}
            stroke={theme.primary}
            strokeWidth={theme.line.emphasis}
            fill={theme.primary}
            fillOpacity={0.22}
            dot={(props: unknown) => (
              <AreaDot
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
            {...getMultiSeriesAreaMotion(theme.key, animate)}
          />
        </AreaChart>
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
          {active.label}: {primaryName} {f(active.value)}; {comparisonName}{" "}
          {f(active.comparison)}; overlaid from zero
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Multi-series area values"
        rows={geometry}
        columns={[
          { key: "label", label: "Observation", value: (r) => r.label },
          {
            key: "value",
            label: primaryName,
            value: (r) => r.value ?? "Missing",
          },
          {
            key: "comparison",
            label: comparisonName,
            value: (r) => r.comparison ?? "Missing",
          },
          { key: "detail", label: "Detail", value: (r) => r.detail ?? "" },
        ]}
      />
    </div>
  );
}
export function MultiSeriesAreaChart({
  data = multiSeriesAreaExample,
  visualSystem = "signal",
  animate,
  title = "Current scale expanded faster than the prior path",
  subtitle = "TWO AREAS · SAME UNIT · OVERLAID FROM ZERO",
  primaryName = "Current",
  comparisonName = "Prior",
  unit = "",
}: MultiSeriesAreaChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateMultiSeriesAreaData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="T07"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · MULTI-SERIES AREA`}
      theme={theme}
      state={state}
      description="Two same-unit areas independently overlaid from a meaningful zero baseline; never stacked."
    >
      <MultiSeriesAreaGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveMultiSeriesAreaAnimation(
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
  buildMultiSeriesAreaGeometry,
  buildMultiSeriesAreaSegments,
  getMultiSeriesAreaDomain,
  mapMultiSeriesAreaX,
  mapMultiSeriesAreaY,
  validateMultiSeriesAreaData,
} from "./schema";
export type {
  MultiSeriesAreaDatum,
  MultiSeriesAreaGeometryDatum,
  MultiSeriesAreaKey,
  MultiSeriesAreaSegment,
} from "./schema";
export {
  multiSeriesAreaExample,
  multiSeriesAreaEdgeCases,
} from "./example-data";
export { multiSeriesAreaMetadata } from "./metadata";
