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
import { stackedAreaExample } from "./example-data";
import { getStackedAreaMotion } from "./motion";
import {
  buildStackedAreaGeometry,
  buildStackedAreaSegments,
  getStackedAreaDomain,
  validateStackedAreaData,
  type StackedAreaDatum,
  type StackedAreaGeometryDatum,
} from "./schema";
export type StackedAreaChartProps = {
  data?: readonly StackedAreaDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  baseName?: string;
  upperName?: string;
  unit?: string;
};
export const formatStackedAreaLabel = (label: string, max = 12) =>
  label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
export const formatStackedAreaValue = (v: number) => {
  const a = Math.abs(v);
  if (a >= 1e9) return `${Number((v / 1e9).toFixed(1))}B`;
  if (a >= 1e6) return `${Number((v / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${Number((v / 1e3).toFixed(1))}K`;
  return Number(v.toFixed(3)).toString();
};
export const resolveStackedAreaAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
type DotProps = {
  cx?: number;
  cy?: number;
  payload?: StackedAreaGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  series: "base" | "upper";
  baseName: string;
  upperName: string;
  unit: string;
};
function StackDot({
  cx = 0,
  cy = 0,
  payload,
  theme,
  series,
  baseName,
  upperName,
  unit,
}: DotProps) {
  if (!payload || payload.missingWhole) return null;
  const color =
    series === "base"
      ? theme.primary
      : theme.key === "signal"
        ? theme.fourth
        : theme.secondary;
  return (
    <g>
      <circle
        data-stack-area-dot={payload.label}
        data-series={series}
        cx={cx}
        cy={cy}
        r={series === "upper" && payload.latestComplete ? 4.5 : 3.5}
        fill={color}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="stacked-area"
            attributeName="r"
            from="0"
            to={series === "upper" && payload.latestComplete ? "4.5" : "3.5"}
            dur="0.7s"
            fill="freeze"
          />
        ) : null}
      </circle>
      {series === "upper" && payload.latestComplete ? (
        <text
          data-stack-area-latest
          x={cx - 7}
          y={cy - 13}
          textAnchor="end"
          fill={theme.text}
          fontSize={theme.label.fontSize}
          fontWeight={theme.label.fontWeight}
        >
          Σ {formatStackedAreaValue(payload.total!)} ·{" "}
          {formatStackedAreaValue(payload.value!)} +{" "}
          {formatStackedAreaValue(payload.comparison!)}
        </text>
      ) : null}
    </g>
  );
}
function StackTooltip({
  active,
  payload,
  theme,
  baseName,
  upperName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: StackedAreaGeometryDatum }[];
  theme: VisualSystemTokens;
  baseName: string;
  upperName: string;
  unit: string;
}) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
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
      <strong>{d.label}</strong>
      {d.missingWhole ? (
        <div>Missing whole total</div>
      ) : (
        <>
          <div>
            {baseName}: {formatStackedAreaValue(d.value!)}
            {unit}
          </div>
          <div>
            {upperName}: {formatStackedAreaValue(d.comparison!)}
            {unit}
          </div>
          <div>
            Total: {formatStackedAreaValue(d.total!)}
            {unit}
          </div>
        </>
      )}
    </div>
  );
}
export function StackedAreaGeometry({
  data,
  theme,
  animate = true,
  baseName = "Core",
  upperName = "Expansion",
  unit = "",
}: {
  data: readonly StackedAreaDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  baseName?: string;
  upperName?: string;
  unit?: string;
}) {
  const geometry = buildStackedAreaGeometry(data).map((d) => ({
      ...d,
      animate,
    })),
    domain = getStackedAreaDomain(data),
    segments = buildStackedAreaSegments(data).length,
    [activeIndex, setActiveIndex] = useState<number | null>(null),
    active = activeIndex === null ? null : geometry[activeIndex],
    upperColor = theme.key === "signal" ? theme.fourth : theme.secondary;
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
  return (
    <div
      role="group"
      aria-label="Stacked area interactive chart"
      data-stacked-area-animation={animate ? "true" : "false"}
      data-stack-id="absolute-total"
      data-normalized="false"
      data-complete-segments={segments}
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
        aria-label="Stacked area legend"
        data-stacked-area-legend
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
              height: 7,
              background: theme.primary,
            }}
          />
          {baseName}
        </span>
        <span
          role="listitem"
          style={{ display: "inline-flex", alignItems: "center", gap: 5 }}
        >
          <i
            aria-hidden="true"
            style={{
              width: theme.legend.iconSize + 7,
              height: 7,
              background: upperColor,
            }}
          />
          {upperName}
        </span>
        <span role="listitem">STACKED ABSOLUTE · NOT NORMALIZED</span>
        <span role="listitem">MISSING PART = WHOLE GAP</span>
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
            tickFormatter={(v) => formatStackedAreaLabel(String(v))}
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
            tickFormatter={(v) => formatStackedAreaValue(Number(v))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip
            cursor={{ stroke: theme.grid, strokeWidth: 1 }}
            content={({ active: ta, payload }) => (
              <StackTooltip
                active={ta}
                payload={
                  payload as unknown as readonly {
                    payload?: StackedAreaGeometryDatum;
                  }[]
                }
                theme={theme}
                baseName={baseName}
                upperName={upperName}
                unit={unit}
              />
            )}
          />
          <Area
            name={baseName}
            type="linear"
            dataKey="chartValue"
            stackId="absolute-total"
            connectNulls={false}
            stroke={theme.primary}
            strokeWidth={theme.line.emphasis}
            fill={theme.primary}
            fillOpacity={0.5}
            dot={(p: unknown) => (
              <StackDot
                {...(p as Omit<
                  DotProps,
                  "theme" | "series" | "baseName" | "upperName" | "unit"
                >)}
                theme={theme}
                series="base"
                baseName={baseName}
                upperName={upperName}
                unit={unit}
              />
            )}
            {...getStackedAreaMotion(theme.key, animate, 0)}
          />
          <Area
            name={upperName}
            type="linear"
            dataKey="chartComparison"
            stackId="absolute-total"
            connectNulls={false}
            stroke={upperColor}
            strokeWidth={theme.line.data}
            fill={upperColor}
            fillOpacity={0.55}
            dot={(p: unknown) => (
              <StackDot
                {...(p as Omit<
                  DotProps,
                  "theme" | "series" | "baseName" | "upperName" | "unit"
                >)}
                theme={theme}
                series="upper"
                baseName={baseName}
                upperName={upperName}
                unit={unit}
              />
            )}
            {...getStackedAreaMotion(theme.key, animate, 1)}
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
          {active.label}:{" "}
          {active.missingWhole
            ? "Missing whole total; both areas break"
            : `${baseName} ${formatStackedAreaValue(active.value!)}${unit}; ${upperName} ${formatStackedAreaValue(active.comparison!)}${unit}; total ${formatStackedAreaValue(active.total!)}${unit}`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Stacked area absolute values"
        rows={geometry}
        columns={[
          { key: "label", label: "Observation", value: (r) => r.label },
          { key: "value", label: baseName, value: (r) => r.value ?? "Missing" },
          {
            key: "comparison",
            label: upperName,
            value: (r) => r.comparison ?? "Missing",
          },
          {
            key: "total",
            label: "Complete total",
            value: (r) => r.total ?? "Missing whole total",
          },
          { key: "detail", label: "Detail", value: (r) => r.detail ?? "" },
        ]}
      />
    </div>
  );
}
export function StackedAreaChart({
  data = stackedAreaExample,
  visualSystem = "signal",
  animate,
  title = "Expansion lifted the absolute total",
  subtitle = "TWO PARTS · STACKED ABSOLUTE · RAW UNITS",
  baseName = "Core",
  upperName = "Expansion",
  unit = "",
}: StackedAreaChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateStackedAreaData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="T08"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · STACKED AREA`}
      theme={theme}
      state={state}
      description="Two non-negative same-unit parts stacked as absolute raw magnitudes; any missing part creates a whole gap."
    >
      <StackedAreaGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveStackedAreaAnimation(
          animate,
          usePrefersReducedMotion(),
        )}
        baseName={baseName}
        upperName={upperName}
        unit={unit}
      />
    </ChartShell>
  );
}
export {
  buildStackedAreaGeometry,
  buildStackedAreaSegments,
  getStackedAreaDomain,
  mapStackedAreaX,
  mapStackedAreaY,
  validateStackedAreaData,
} from "./schema";
export type {
  StackedAreaDatum,
  StackedAreaGeometryDatum,
  StackedAreaSegment,
} from "./schema";
export { stackedAreaExample, stackedAreaEdgeCases } from "./example-data";
export { stackedAreaMetadata } from "./metadata";
