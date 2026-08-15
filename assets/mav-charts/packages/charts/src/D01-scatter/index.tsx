import { useState, type KeyboardEvent } from "react";
import {
  CartesianGrid,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
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
import { scatterExample } from "./example-data";
import { getScatterMotion } from "./motion";
import {
  buildScatterGeometry,
  getScatterDomain,
  validateScatterData,
  type ScatterDatum,
  type ScatterGeometryDatum,
} from "./schema";
export type ScatterChartProps = {
  data?: readonly ScatterDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  xName?: string;
  yName?: string;
  unit?: string;
};
export const formatScatterValue = (value: number) => {
  const a = Math.abs(value);
  if (a >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (a >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const formatScatterLabel = (label: string, max = 16) =>
  label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
export const resolveScatterAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
type ShapeProps = {
  cx?: number;
  cy?: number;
  payload?: ScatterGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
};
function ScatterPoint({ cx = 0, cy = 0, payload, theme }: ShapeProps) {
  if (!payload || payload.missing) return null;
  const color = payload.focus ? theme.primary : theme.secondary,
    radius = payload.focus ? 8 : 5.5;
  return (
    <g>
      <circle
        data-scatter-point={payload.label}
        data-focus={payload.focus ? "true" : "false"}
        cx={cx}
        cy={cy}
        r={radius}
        fill={color}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="scatter"
            attributeName="r"
            from="0"
            to={radius}
            dur="0.65s"
            fill="freeze"
          />
        ) : null}
      </circle>
      <text
        data-scatter-label={payload.label}
        x={cx + payload.labelDx}
        y={cy + payload.labelDy}
        textAnchor={payload.labelDx < 0 ? "end" : "start"}
        fill={payload.focus ? theme.primary : theme.muted}
        fontSize={theme.label.fontSize}
        fontWeight={theme.label.fontWeight}
      >
        {formatScatterLabel(payload.label)}
      </text>
    </g>
  );
}
function ScatterTooltip({
  active,
  payload,
  theme,
  xName,
  yName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: ScatterGeometryDatum }[];
  theme: VisualSystemTokens;
  xName: string;
  yName: string;
  unit: string;
}) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  return (
    <div
      style={{
        padding: theme.tooltip.padding,
        border: `1px solid ${theme.grid}`,
        background: theme.surfaceAlt,
        color: theme.text,
        fontSize: theme.label.fontSize,
      }}
    >
      <strong>{d.label}</strong>
      <div>
        {xName}:{" "}
        {d.value === null ? "Missing" : `${formatScatterValue(d.value)}${unit}`}
      </div>
      <div>
        {yName}:{" "}
        {d.comparison === null
          ? "Missing"
          : `${formatScatterValue(d.comparison)}${unit}`}
      </div>
    </div>
  );
}
export function ScatterGeometry({
  data,
  theme,
  animate = true,
  xName = "X value",
  yName = "Y value",
  unit = "",
}: {
  data: readonly ScatterDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  xName?: string;
  yName?: string;
  unit?: string;
}) {
  const geometry = buildScatterGeometry(data).map((d) => ({ ...d, animate })),
    plotted = geometry.filter((d) => !d.missing),
    xDomain = getScatterDomain(data, "value"),
    yDomain = getScatterDomain(data, "comparison");
  const [activeIndex, setActiveIndex] = useState<number | null>(null),
    active = activeIndex === null ? null : geometry[activeIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !geometry.length ||
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    setActiveIndex((i) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? geometry.length - 1
          : event.key === "ArrowRight"
            ? ((i ?? 0) + 1) % geometry.length
            : ((i ?? 0) - 1 + geometry.length) % geometry.length,
    );
  };
  return (
    <div
      role="group"
      aria-label="Scatter interactive chart"
      tabIndex={0}
      onFocus={() => setActiveIndex((i) => i ?? 0)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={onKeyDown}
      data-scatter-animation={animate ? "true" : "false"}
      data-x-domain-min={xDomain[0]}
      data-x-domain-max={xDomain[1]}
      data-y-domain-min={yDomain[0]}
      data-y-domain-max={yDomain[1]}
      data-plotted-count={plotted.length}
      data-missing-count={geometry.length - plotted.length}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        outline: "none",
      }}
    >
      <div
        role="list"
        aria-label="Scatter legend"
        data-scatter-legend
        style={{
          position: "absolute",
          zIndex: 3,
          top: 24,
          right: 8,
          display: "flex",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span role="listitem">
          <b style={{ color: theme.primary }}>●</b> Focus
        </span>
        <span role="listitem">
          <b style={{ color: theme.secondary }}>●</b> Context
        </span>
        <span role="listitem">Missing = no point</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 68, right: 72, bottom: 16, left: 8 }}
          accessibilityLayer
        >
          <CartesianGrid
            stroke={theme.grid}
            strokeDasharray={theme.chart.gridDash}
          />
          <XAxis
            type="number"
            dataKey="value"
            name={xName}
            domain={[...xDomain]}
            tickFormatter={(v) => formatScatterValue(Number(v))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="comparison"
            name={yName}
            domain={[...yDomain]}
            tickFormatter={(v) => formatScatterValue(Number(v))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={62}
          />
          <Tooltip
            cursor={{ stroke: theme.grid }}
            content={({ active, payload }) => (
              <ScatterTooltip
                active={active}
                payload={
                  payload as unknown as readonly {
                    payload?: ScatterGeometryDatum;
                  }[]
                }
                theme={theme}
                xName={xName}
                yName={yName}
                unit={unit}
              />
            )}
          />
          <Scatter
            data={plotted}
            shape={(p: unknown) => (
              <ScatterPoint
                {...(p as Omit<ShapeProps, "theme">)}
                theme={theme}
              />
            )}
            {...getScatterMotion(theme.key, animate)}
          />
        </ScatterChart>
      </ResponsiveContainer>
      {active ? (
        <div
          role="status"
          style={{
            position: "absolute",
            zIndex: 4,
            right: 8,
            bottom: 4,
            padding: theme.tooltip.padding,
            border: `1px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.label}:{" "}
          {active.missing
            ? "Missing point; one or both coordinates unavailable"
            : `${xName} ${formatScatterValue(active.value!)}${unit}; ${yName} ${formatScatterValue(active.comparison!)}${unit}`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Scatter coordinates"
        rows={geometry}
        columns={[
          { key: "label", label: "Point", value: (r) => r.label },
          { key: "x", label: xName, value: (r) => r.value ?? "Missing" },
          { key: "y", label: yName, value: (r) => r.comparison ?? "Missing" },
          {
            key: "state",
            label: "State",
            value: (r) => (r.missing ? "Missing point" : "Plotted"),
          },
        ]}
      />
    </div>
  );
}
export function ScatterChartTemplate({
  data = scatterExample,
  visualSystem = "signal",
  animate,
  title = "The first point anchors the relationship",
  subtitle = "TWO QUANTITATIVE VARIABLES · INDEPENDENT SCALES",
  xName = "X value",
  yName = "Y value",
  unit = "",
}: ScatterChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateScatterData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="D01"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · SCATTER`}
      theme={theme}
      state={state}
      description="Two quantitative coordinates with independent honest domains; missing coordinates do not render a point."
    >
      <ScatterGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveScatterAnimation(animate, usePrefersReducedMotion())}
        xName={xName}
        yName={yName}
        unit={unit}
      />
    </ChartShell>
  );
}
export {
  buildScatterGeometry,
  getScatterDomain,
  mapScatterX,
  mapScatterY,
  validateScatterData,
} from "./schema";
export type { ScatterDatum, ScatterGeometryDatum } from "./schema";
export { scatterExample, scatterEdgeCases } from "./example-data";
export { scatterMetadata } from "./metadata";
