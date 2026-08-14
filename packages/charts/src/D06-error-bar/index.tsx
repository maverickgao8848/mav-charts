import { useState, type KeyboardEvent } from "react";
import {
  CartesianGrid,
  ErrorBar,
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
import { errorBarExample } from "./example-data";
import { getErrorBarMotion } from "./motion";
import {
  buildErrorBarGeometry,
  getErrorBarDomain,
  getErrorBarXDomain,
  validateErrorBarData,
  type ErrorBarDatum,
  type ErrorBarGeometryDatum,
} from "./schema";

export type ErrorBarChartProps = {
  data?: readonly ErrorBarDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  seriesName?: string;
  unit?: string;
};
export const formatErrorBarLabel = (label: string, max = 14) =>
  label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
export const formatErrorBarValue = (value: number) => {
  const a = Math.abs(value);
  if (a >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (a >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(4)).toString();
};
export const resolveErrorBarAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;

type ShapeProps = {
  cx?: number;
  cy?: number;
  payload?: ErrorBarGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  unit: string;
};
function EstimateShape({ cx = 0, cy = 0, payload, theme, unit }: ShapeProps) {
  if (!payload) return null;
  const color = payload.focused
    ? theme.primary
    : theme.key === "signal"
      ? theme.text
      : theme.secondary;
  return (
    <g
      data-error-point={payload.label}
      data-focused={payload.focused ? "true" : "false"}
      data-estimate={payload.estimate}
      data-lower={payload.lower}
      data-upper={payload.upper}
    >
      <circle
        cx={cx}
        cy={cy}
        r={payload.focused ? 6 : 4.5}
        fill={color}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="error-bar"
            attributeName="r"
            from="0"
            to={payload.focused ? "6" : "4.5"}
            dur=".65s"
            fill="freeze"
          />
        ) : null}
      </circle>
      <text
        data-error-estimate={payload.label}
        x={cx + payload.labelDx}
        y={cy + payload.labelDy}
        textAnchor={payload.labelAnchor}
        fill={payload.focused ? theme.primary : theme.muted}
        fontSize={theme.label.fontSize}
        fontWeight={theme.label.fontWeight}
      >
        {formatErrorBarValue(payload.estimate)}
        {unit}
      </text>
    </g>
  );
}

function ErrorTooltip({
  active,
  payload,
  theme,
  seriesName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: ErrorBarGeometryDatum }[];
  theme: VisualSystemTokens;
  seriesName: string;
  unit: string;
}) {
  const d = payload?.[0]?.payload;
  if (!active || !d) return null;
  const value = (v: number) => `${formatErrorBarValue(v)}${unit}`;
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
      <div>
        {seriesName}: {value(d.estimate)}
      </div>
      <div>Lower: {value(d.lower)}</div>
      <div>Upper: {value(d.upper)}</div>
      <small style={{ color: theme.muted }}>
        −{value(d.lowerError)} / +{value(d.upperError)}
      </small>
      {d.detail ? <div style={{ color: theme.muted }}>{d.detail}</div> : null}
    </div>
  );
}

export function ErrorBarGeometry({
  data,
  theme,
  animate = true,
  seriesName = "Estimate",
  unit = "",
}: {
  data: readonly ErrorBarDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  seriesName?: string;
  unit?: string;
}) {
  const geometry = buildErrorBarGeometry(data).map((d) => ({ ...d, animate })),
    domain = getErrorBarDomain(data),
    xDomain = getErrorBarXDomain(data.length),
    focus = geometry.filter((d) => d.focused),
    context = geometry.filter((d) => !d.focused),
    motion = getErrorBarMotion(theme.key, animate),
    [activeIndex, setActiveIndex] = useState<number | null>(null),
    active = activeIndex === null ? null : geometry[activeIndex],
    contextColor = theme.key === "signal" ? theme.text : theme.secondary;
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
  const tableRows = data.map((d, index) => ({
    ...d,
    index,
    lowerError:
      d.estimate !== null && d.lower !== null ? d.estimate - d.lower : null,
    upperError:
      d.estimate !== null && d.upper !== null ? d.upper - d.estimate : null,
  }));
  const scatter = (
    rows: readonly (ErrorBarGeometryDatum & { animate: boolean })[],
    color: string,
    focusLayer: boolean,
  ) => (
    <Scatter
      name={focusLayer ? `${seriesName} focus` : `${seriesName} context`}
      data={rows}
      shape={(p: unknown) => (
        <EstimateShape
          {...(p as Omit<ShapeProps, "theme" | "unit">)}
          theme={theme}
          unit={unit}
        />
      )}
      {...motion}
    >
      <ErrorBar
        dataKey="errors"
        direction="y"
        width={7}
        stroke={color}
        strokeWidth={focusLayer ? 2.5 : 1.75}
        {...motion}
      />
    </Scatter>
  );
  return (
    <div
      role="group"
      aria-label="Error bar interactive chart"
      data-error-animation={animate ? "true" : "false"}
      data-domain-min={domain[0]}
      data-domain-max={domain[1]}
      data-visible-estimates={geometry.length}
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
        aria-label="Error bar legend"
        data-error-legend
        style={{
          position: "absolute",
          zIndex: 3,
          top: 8,
          right: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span role="listitem" style={{ color: theme.primary }}>
          ● Focus estimate
        </span>
        <span role="listitem" style={{ color: contextColor }}>
          ● Context estimate
        </span>
        <span role="listitem">WHISKERS = ABSOLUTE LOWER / UPPER</span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 58, right: 44, left: 0, bottom: 12 }}
          accessibilityLayer
        >
          <CartesianGrid
            vertical={false}
            stroke={theme.grid}
            strokeDasharray={theme.chart.gridDash}
          />
          <XAxis
            type="number"
            dataKey="index"
            domain={[...xDomain]}
            ticks={data.map((_, i) => i)}
            tickFormatter={(v) =>
              formatErrorBarLabel(data[Number(v)]?.label ?? "")
            }
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="estimate"
            domain={[...domain]}
            tickFormatter={(v) => formatErrorBarValue(Number(v))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={58}
          />
          <Tooltip
            cursor={{ stroke: theme.grid, strokeDasharray: "4 4" }}
            content={({ active: ta, payload }) => (
              <ErrorTooltip
                active={ta}
                payload={
                  payload as unknown as readonly {
                    payload?: ErrorBarGeometryDatum;
                  }[]
                }
                theme={theme}
                seriesName={seriesName}
                unit={unit}
              />
            )}
          />
          {scatter(context, contextColor, false)}
          {scatter(focus, theme.primary, true)}
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
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.label}: {seriesName} {formatErrorBarValue(active.estimate)}
          {unit}; lower {formatErrorBarValue(active.lower)}
          {unit}; upper {formatErrorBarValue(active.upper)}
          {unit}; −{formatErrorBarValue(active.lowerError)}
          {unit} / +{formatErrorBarValue(active.upperError)}
          {unit}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Estimate and absolute error bounds"
        rows={tableRows}
        columns={[
          { key: "label", label: "Category", value: (r) => r.label },
          {
            key: "estimate",
            label: seriesName,
            value: (r) => r.estimate ?? "Missing",
          },
          {
            key: "lower",
            label: "Absolute lower",
            value: (r) => r.lower ?? "Missing",
          },
          {
            key: "upper",
            label: "Absolute upper",
            value: (r) => r.upper ?? "Missing",
          },
          {
            key: "minus",
            label: "Minus distance",
            value: (r) => r.lowerError ?? "Missing",
          },
          {
            key: "plus",
            label: "Plus distance",
            value: (r) => r.upperError ?? "Missing",
          },
          { key: "detail", label: "Detail", value: (r) => r.detail ?? "" },
        ]}
      />
    </div>
  );
}

export function ErrorBarChart({
  data = errorBarExample,
  visualSystem = "signal",
  animate,
  title = "North leads despite wider uncertainty",
  subtitle = "ESTIMATE · ABSOLUTE LOWER / UPPER",
  seriesName = "Estimate",
  unit = "",
}: ErrorBarChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateErrorBarData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="D06"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · ERROR BAR`}
      theme={theme}
      state={state}
      description="Category estimates with caller-supplied absolute lower and upper bounds in the same unit; no confidence-level inference."
    >
      <ErrorBarGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveErrorBarAnimation(animate, usePrefersReducedMotion())}
        seriesName={seriesName}
        unit={unit}
      />
    </ChartShell>
  );
}
export {
  buildErrorBarGeometry,
  getErrorBarDomain,
  getErrorBarXDomain,
  mapErrorBarX,
  mapErrorBarY,
  validateErrorBarData,
} from "./schema";
export type { ErrorBarDatum, ErrorBarGeometryDatum } from "./schema";
export { errorBarExample, errorBarEdgeCases } from "./example-data";
export { errorBarMetadata } from "./metadata";
