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
import { valueDotLineExample } from "./example-data";
import { getValueDotLineMotion } from "./motion";
import {
  buildValueDotLineGeometry,
  buildValueDotLineSegments,
  getValueDotLineDomain,
  validateValueDotLineData,
  type ValueDotLineDatum,
  type ValueDotLineGeometryDatum,
} from "./schema";

export type ValueDotLineChartProps = {
  data?: readonly ValueDotLineDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  seriesName?: string;
  unit?: string;
};

export const formatValueDotLineLabel = (label: string, maximum = 12) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;

export const formatValueDotLineValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000)
    return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  if (absolute >= 1_000_000)
    return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (absolute >= 1_000)
    return `${Number((value / 1_000).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};

export const resolveValueDotLineAnimation = (
  animate: boolean | undefined,
  reducedMotion: boolean,
) => animate ?? !reducedMotion;

type ValueDotProps = {
  cx?: number;
  cy?: number;
  payload?: ValueDotLineGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  unit: string;
};

function ValueDot({ cx = 0, cy = 0, payload, theme, unit }: ValueDotProps) {
  if (!payload || payload.value === null) return null;
  const y = cy + payload.labelLane * 18;
  const x = cx + (payload.labelAnchor === "start" ? 7 : payload.labelAnchor === "end" ? -7 : 0);
  return (
    <g data-value-dot-group={payload.label}>
      <circle
        data-value-dot={payload.label}
        cx={cx}
        cy={cy}
        r={theme.key === "signal" ? 7 : 5}
        fill={theme.primary}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="value-dot-line"
            attributeName="r"
            from="0"
            to={theme.key === "signal" ? "7" : "5"}
            dur="0.7s"
            fill="freeze"
          />
        ) : null}
      </circle>
      <text
        data-value-label={payload.label}
        data-label-lane={payload.labelLane}
        x={x}
        y={y}
        dominantBaseline="middle"
        textAnchor={payload.labelAnchor}
        fill={theme.text}
        fontSize={theme.label.fontSize}
        fontWeight={800}
      >
        {formatValueDotLineValue(payload.value)}{unit}
      </text>
    </g>
  );
}

function ValueDotTooltip({
  active,
  payload,
  theme,
  seriesName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: ValueDotLineGeometryDatum }[];
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
        {seriesName}: {datum.value === null ? "Missing" : `${formatValueDotLineValue(datum.value)}${unit}`}
      </div>
      {datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}
    </div>
  );
}

export function ValueDotLineGeometry({
  data,
  theme,
  animate = true,
  seriesName = "Value",
  unit = "",
}: {
  data: readonly ValueDotLineDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  seriesName?: string;
  unit?: string;
}) {
  const geometry = buildValueDotLineGeometry(data).map((datum) => ({ ...datum, animate }));
  const domain = getValueDotLineDomain(data);
  const segments = buildValueDotLineSegments(data);
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
      aria-label="Value dot line interactive chart"
      data-value-dot-animation={animate ? "true" : "false"}
      data-value-dot-segments={segments.length}
      data-domain-min={domain[0]}
      data-domain-max={domain[1]}
      tabIndex={0}
      onFocus={() => setActiveIndex((current) => current ?? 0)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={onKeyDown}
      style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}
    >
      <div
        role="list"
        aria-label="Value dot line legend"
        data-value-dot-legend
        style={{
          position: "absolute",
          zIndex: 2,
          top: 8,
          right: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}>
          <i aria-hidden="true" style={{ width: theme.legend.iconSize + 7, height: 3, background: theme.primary }} />
          {seriesName} · direct labels
        </span>
        <span role="listitem">Missing = line break</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={geometry} margin={{ top: 54, right: 34, left: 0, bottom: 10 }} accessibilityLayer>
          <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
          <XAxis
            dataKey="label"
            interval={0}
            tickFormatter={(label) => formatValueDotLineLabel(String(label))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[...domain]}
            tickFormatter={(value) => formatValueDotLineValue(Number(value))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip
            cursor={{ stroke: theme.grid, strokeWidth: 1 }}
            content={({ active: tooltipActive, payload }) => (
              <ValueDotTooltip
                active={tooltipActive}
                payload={payload as unknown as readonly { payload?: ValueDotLineGeometryDatum }[]}
                theme={theme}
                seriesName={seriesName}
                unit={unit}
              />
            )}
          />
          <Line
            name={seriesName}
            type="linear"
            dataKey="value"
            connectNulls={false}
            stroke={theme.primary}
            strokeWidth={theme.line.emphasis}
            strokeLinecap="round"
            strokeLinejoin="round"
            dot={(props: unknown) => (
              <ValueDot {...(props as Omit<ValueDotProps, "theme" | "unit">)} theme={theme} unit={unit} />
            )}
            activeDot={{ r: 8, fill: theme.primary, stroke: theme.background }}
            {...getValueDotLineMotion(theme.key, animate)}
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
          {active.label}: {active.value === null ? "Missing; line breaks here" : `${seriesName} ${formatValueDotLineValue(active.value)}${unit}`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Value dot line observations"
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

export function ValueDotLineChart({
  data = valueDotLineExample,
  visualSystem = "signal",
  animate,
  title = "Every observation is labelled, not estimated",
  subtitle = "ONE METRIC · DIRECT VALUES · EQUAL SPACING",
  seriesName = "Value",
  unit = "",
}: ValueDotLineChartProps) {
  const theme = getVisualSystem(visualSystem);
  const validation = validateValueDotLineData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="T04"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · VALUE DOT LINE`}
      theme={theme}
      state={state}
      description="One ordered equal-spacing metric with a dot and direct value label at every finite observation; missing values break the line."
    >
      <ValueDotLineGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveValueDotLineAnimation(animate, usePrefersReducedMotion())}
        seriesName={seriesName}
        unit={unit}
      />
    </ChartShell>
  );
}

export {
  buildValueDotLineGeometry,
  buildValueDotLineSegments,
  getValueDotLineDomain,
  mapValueDotLineX,
  mapValueDotLineY,
  validateValueDotLineData,
} from "./schema";
export type {
  ValueDotLabelAnchor,
  ValueDotLabelLane,
  ValueDotLineDatum,
  ValueDotLineGeometryDatum,
  ValueDotLineSegment,
} from "./schema";
export { valueDotLineExample, valueDotLineEdgeCases } from "./example-data";
export { valueDotLineMetadata } from "./metadata";
