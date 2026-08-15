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
import { stepLineExample } from "./example-data";
import { getStepLineMotion } from "./motion";
import {
  buildStepAfterPaths,
  buildStepLineGeometry,
  buildStepLineSegments,
  getStepLineDomain,
  validateStepLineData,
  type StepLineDatum,
  type StepLineGeometryDatum,
} from "./schema";

export type StepLineChartProps = {
  data?: readonly StepLineDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  seriesName?: string;
  unit?: string;
};
export const formatStepLineLabel = (label: string, maximum = 12) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatStepLineValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000)
    return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  if (absolute >= 1_000_000)
    return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (absolute >= 1_000) return `${Number((value / 1_000).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const resolveStepLineAnimation = (
  animate: boolean | undefined,
  reducedMotion: boolean,
) => animate ?? !reducedMotion;

type DotProps = {
  cx?: number;
  cy?: number;
  payload?: StepLineGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  unit: string;
};
function StepDot({ cx = 0, cy = 0, payload, theme, unit }: DotProps) {
  if (!payload || payload.value === null) return null;
  const radius = payload.latestValid ? 4.5 : 3.5;
  return (
    <g>
      <circle
        data-step-dot={payload.label}
        data-latest-valid={payload.latestValid ? "true" : "false"}
        cx={cx}
        cy={cy}
        r={radius}
        fill={theme.primary}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="step-line"
            attributeName="r"
            from="0"
            to={String(radius)}
            dur="0.7s"
            fill="freeze"
          />
        ) : null}
      </circle>
      {payload.latestValid ? (
        <text
          data-step-latest
          x={cx - 7}
          y={cy - 13}
          textAnchor="end"
          fill={theme.primary}
          fontSize={theme.label.fontSize}
          fontWeight={theme.label.fontWeight}
        >
          LATEST {formatStepLineValue(payload.value)}
          {unit}
        </text>
      ) : null}
    </g>
  );
}

function StepTooltip({
  active,
  payload,
  theme,
  seriesName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: StepLineGeometryDatum }[];
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
        {seriesName}:{" "}
        {datum.value === null
          ? "Missing"
          : `${formatStepLineValue(datum.value)}${unit}`}
      </div>
      <div style={{ color: theme.muted }}>
        Applies after this observation until the next.
      </div>
      {datum.detail ? (
        <small style={{ color: theme.muted }}>{datum.detail}</small>
      ) : null}
    </div>
  );
}

export function StepLineGeometry({
  data,
  theme,
  animate = true,
  seriesName = "State",
  unit = "",
}: {
  data: readonly StepLineDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  seriesName?: string;
  unit?: string;
}) {
  const geometry = buildStepLineGeometry(data).map((datum) => ({
    ...datum,
    animate,
  }));
  const domain = getStepLineDomain(data);
  const semanticPaths = buildStepAfterPaths(data, [0, 100], [100, 0]);
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
  return (
    <div
      role="group"
      aria-label="Step line interactive chart"
      data-step-animation={animate ? "true" : "false"}
      data-step-after="true"
      data-step-segments={buildStepLineSegments(data).length}
      data-semantic-step-paths={JSON.stringify(semanticPaths)}
      data-domain-min={domain[0]}
      data-domain-max={domain[1]}
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
        aria-label="Step line legend"
        data-step-legend
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
          {seriesName}
        </span>
        <span role="listitem">stepAfter · holds, then jumps</span>
        <span role="listitem">Missing = line break</span>
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
            tickFormatter={(label) => formatStepLineLabel(String(label))}
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
            tickFormatter={(value) => formatStepLineValue(Number(value))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={54}
          />
          <Tooltip
            cursor={{ stroke: theme.grid, strokeWidth: 1 }}
            content={({ active: tooltipActive, payload }) => (
              <StepTooltip
                active={tooltipActive}
                payload={
                  payload as unknown as readonly {
                    payload?: StepLineGeometryDatum;
                  }[]
                }
                theme={theme}
                seriesName={seriesName}
                unit={unit}
              />
            )}
          />
          <Line
            name={seriesName}
            type="stepAfter"
            dataKey="value"
            connectNulls={false}
            stroke={theme.primary}
            strokeWidth={theme.line.emphasis}
            strokeLinecap="square"
            strokeLinejoin="miter"
            dot={(props: unknown) => (
              <StepDot
                {...(props as Omit<DotProps, "theme" | "unit">)}
                theme={theme}
                unit={unit}
              />
            )}
            activeDot={{ r: 6, fill: theme.primary, stroke: theme.background }}
            {...getStepLineMotion(theme.key, animate)}
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
          {active.label}:{" "}
          {active.value === null
            ? "Missing; step path breaks here"
            : `${seriesName} ${formatStepLineValue(active.value)}${unit}; held until next observation`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Step line values"
        rows={geometry}
        columns={[
          { key: "label", label: "Observation", value: (row) => row.label },
          {
            key: "value",
            label: `${seriesName}${unit ? ` (${unit})` : ""}`,
            value: (row) => row.value ?? "Missing",
          },
          {
            key: "meaning",
            label: "Step meaning",
            value: (row) =>
              row.value === null ? "Path break" : "Held until next observation",
          },
          { key: "detail", label: "Detail", value: (row) => row.detail ?? "" },
        ]}
      />
    </div>
  );
}

export function StepLineChart({
  data = stepLineExample,
  visualSystem = "signal",
  animate,
  title = "The operating state changed in discrete jumps",
  subtitle = "STEP AFTER · HOLD, THEN CHANGE",
  seriesName = "State",
  unit = "",
}: StepLineChartProps) {
  const theme = getVisualSystem(visualSystem);
  const validation = validateStepLineData(data);
  const state =
    data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="T03"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · STEP LINE`}
      theme={theme}
      state={state}
      description="An ordered equal-spacing value held through each interval and changed at the next observation."
    >
      <StepLineGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveStepLineAnimation(animate, usePrefersReducedMotion())}
        seriesName={seriesName}
        unit={unit}
      />
    </ChartShell>
  );
}

export {
  buildStepAfterPath,
  buildStepAfterPaths,
  buildStepLineGeometry,
  buildStepLineSegments,
  getStepLineDomain,
  mapStepLineX,
  mapStepLineY,
  validateStepLineData,
} from "./schema";
export type {
  StepLineDatum,
  StepLineGeometryDatum,
  StepLinePoint,
  StepLineSegment,
} from "./schema";
export { stepLineExample, stepLineEdgeCases } from "./example-data";
export { stepLineMetadata } from "./metadata";
