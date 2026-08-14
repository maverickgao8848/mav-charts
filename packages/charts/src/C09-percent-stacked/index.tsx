import { useState, type KeyboardEvent } from "react";
import {
  Bar,
  BarChart,
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
import { percentStackedExample } from "./example-data";
import { getPercentStackedMotion } from "./motion";
import {
  buildPercentStackedGeometry,
  validatePercentStackedData,
  type PercentStackedDatum,
  type PercentStackedGeometryDatum,
  type PercentStackedSeriesKey,
} from "./schema";
export type PercentStackedChartProps = {
  data?: readonly PercentStackedDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  primaryName?: string;
  comparisonName?: string;
  unit?: string;
};
export const formatPercentStackedLabel = (label: string, maximum = 14) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatPercentStackedRaw = (value: number) => {
  const a = Math.abs(value);
  if (a >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (a >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const resolvePercentStackedAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
type ShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: PercentStackedGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  series: PercentStackedSeriesKey;
};
function PercentShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  theme,
  series,
}: ShapeProps) {
  if (!payload?.complete) return null;
  const share =
      series === "value" ? payload.valueShare : payload.comparisonShare,
    percent =
      series === "value" ? payload.valuePercent : payload.comparisonPercent,
    start = series === "value" ? payload.valueStart : payload.comparisonStart,
    end = series === "value" ? payload.valueEnd : payload.comparisonEnd;
  if (share === null || percent === null) return null;
  const rectY = Math.min(y, y + height),
    rectHeight = Math.abs(height),
    primary = series === "value",
    fill = primary
      ? theme.primary
      : theme.key === "signal"
        ? theme.secondary
        : theme.secondary,
    textFill = primary ? theme.text : theme.background;
  return (
    <g
      data-percent-bar={`${payload.label}:${series}`}
      data-series={series}
      data-category={payload.label}
      data-share={share}
      data-segment-start={start ?? "missing"}
      data-segment-end={end ?? "missing"}
    >
      <rect
        x={x}
        y={rectY}
        width={width}
        height={rectHeight}
        rx={theme.radius.mark}
        fill={fill}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="percent-stacked"
            attributeName="opacity"
            from="0"
            to="1"
            dur="0.72s"
            fill="freeze"
          />
        ) : null}
      </rect>
      {rectHeight >= 18 ? (
        <text
          data-percent-label
          x={x + width / 2}
          y={rectY + rectHeight / 2 + theme.label.fontSize / 3}
          textAnchor="middle"
          fill={textFill}
          fontSize={theme.label.fontSize}
          fontWeight={theme.label.fontWeight}
          style={{ pointerEvents: "none" }}
        >
          {percent}%
        </text>
      ) : null}
    </g>
  );
}
function Tip({
  active,
  payload,
  theme,
  primaryName,
  comparisonName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: PercentStackedGeometryDatum }[];
  theme: VisualSystemTokens;
  primaryName: string;
  comparisonName: string;
  unit: string;
}) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  const raw = (value: number) =>
    `${formatPercentStackedRaw(value)}${unit ? ` ${unit}` : ""}`;
  return (
    <div
      style={{
        padding: theme.tooltip.padding,
        border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
        background: theme.surfaceAlt,
        color: theme.text,
      }}
    >
      <strong>{d.label}</strong>
      {d.complete ? (
        <>
          <div>
            {primaryName}: {raw(d.value!)} · {(d.valueShare! * 100).toFixed(2)}%
          </div>
          <div>
            {comparisonName}: {raw(d.comparison!)} ·{" "}
            {(d.comparisonShare! * 100).toFixed(2)}%
          </div>
          <div>Raw total: {raw(d.total!)}</div>
        </>
      ) : (
        <div>Incomplete · whole column omitted</div>
      )}
    </div>
  );
}
export function PercentStackedGeometry({
  data,
  theme,
  animate = true,
  primaryName = "Primary",
  comparisonName = "Comparison",
  unit = "",
}: {
  data: readonly PercentStackedDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  primaryName?: string;
  comparisonName?: string;
  unit?: string;
}) {
  const geometry = buildPercentStackedGeometry(data).map((d) => ({
    ...d,
    animate,
  }));
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : geometry[activeIndex];
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
  return (
    <div
      role="group"
      aria-label="100 percent stacked interactive chart"
      data-percent-animation={animate ? "true" : "false"}
      tabIndex={0}
      onFocus={() => setActiveIndex((i) => i ?? 0)}
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
        aria-label="100 percent stacked legend"
        data-percent-legend
        style={{
          position: "absolute",
          top: 6,
          left: 8,
          zIndex: 2,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span role="listitem" style={{ color: theme.primary }}>
          ■ {primaryName}
        </span>
        <span role="listitem">□ {comparisonName}</span>
        <span role="listitem">Missing segment = whole-column gap</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={geometry}
          margin={{ top: 52, right: 16, left: 0, bottom: 8 }}
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
            tickFormatter={(label) => formatPercentStackedLabel(String(label))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(v) => `${v}%`}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <Tooltip
            cursor={{ fill: theme.grid, opacity: 0.2 }}
            content={({ active: a, payload }) => (
              <Tip
                active={a}
                payload={
                  payload as unknown as readonly {
                    payload?: PercentStackedGeometryDatum;
                  }[]
                }
                theme={theme}
                primaryName={primaryName}
                comparisonName={comparisonName}
                unit={unit}
              />
            )}
          />
          <Bar
            dataKey="valueEnd"
            name={primaryName}
            stackId="share"
            maxBarSize={96}
            shape={(props: unknown) => (
              <PercentShape
                {...(props as Omit<ShapeProps, "theme" | "series">)}
                theme={theme}
                series="value"
              />
            )}
            {...getPercentStackedMotion(theme.key, animate, 0)}
          />
          <Bar
            dataKey={(datum: PercentStackedGeometryDatum) =>
              datum.comparisonShare === null ? null : datum.comparisonShare * 100
            }
            name={comparisonName}
            stackId="share"
            maxBarSize={96}
            shape={(props: unknown) => (
              <PercentShape
                {...(props as Omit<ShapeProps, "theme" | "series">)}
                theme={theme}
                series="comparison"
              />
            )}
            {...getPercentStackedMotion(theme.key, animate, 1)}
          />
        </BarChart>
      </ResponsiveContainer>
      {active ? (
        <div
          role="status"
          style={{
            position: "absolute",
            right: 8,
            bottom: 4,
            padding: theme.tooltip.padding,
            background: theme.surfaceAlt,
            color: theme.text,
          }}
        >
          {active.label}:{" "}
          {active.complete
            ? `${primaryName} ${active.valuePercent}% (${formatPercentStackedRaw(active.value!)} raw); ${comparisonName} ${active.comparisonPercent}% (${formatPercentStackedRaw(active.comparison!)} raw)`
            : "incomplete; whole column omitted"}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="100 percent stacked values"
        rows={geometry}
        columns={[
          { key: "label", label: "Category", value: (d) => d.label },
          {
            key: "primaryRaw",
            label: `${primaryName} raw`,
            value: (d) => d.value ?? "Missing",
          },
          {
            key: "comparisonRaw",
            label: `${comparisonName} raw`,
            value: (d) => d.comparison ?? "Missing",
          },
          {
            key: "primaryShare",
            label: `${primaryName} precise share`,
            value: (d) =>
              d.valueShare === null
                ? "Missing"
                : `${(d.valueShare * 100).toFixed(4)}%`,
          },
          {
            key: "comparisonShare",
            label: `${comparisonName} precise share`,
            value: (d) =>
              d.comparisonShare === null
                ? "Missing"
                : `${(d.comparisonShare * 100).toFixed(4)}%`,
          },
        ]}
      />
    </div>
  );
}
export function PercentStackedChart({
  data = percentStackedExample,
  visualSystem = "signal",
  animate,
  title = "The mix shifted toward primary",
  subtitle = "TWO-PART COMPOSITION · NORMALIZED TO 100%",
  primaryName = "Primary",
  comparisonName = "Comparison",
  unit = "",
}: PercentStackedChartProps) {
  const theme = getVisualSystem(visualSystem);
  const validation = validatePercentStackedData(data);
  const state =
    data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="C09"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · 100% STACKED`}
      theme={theme}
      state={state}
      description="Complete non-negative two-part raw values normalize to a fixed 0–100% composition scale."
    >
      <PercentStackedGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolvePercentStackedAnimation(
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
  buildPercentStackedGeometry,
  getPercentPair,
  getPercentStackedSegmentHeight,
  mapPercentStackedY,
  validatePercentStackedData,
} from "./schema";
export type {
  PercentStackedDatum,
  PercentStackedGeometryDatum,
  PercentStackedSeriesKey,
} from "./schema";
export { percentStackedExample, percentStackedEdgeCases } from "./example-data";
export { percentStackedMetadata } from "./metadata";
