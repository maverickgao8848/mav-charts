import { useState, type KeyboardEvent } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
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
import { columnTargetExample } from "./example-data";
import { getColumnTargetMotion } from "./motion";
import {
  buildColumnTargetGeometry,
  getColumnTargetDomain,
  normalizeColumnTargetRect,
  validateColumnTargetData,
  type ColumnTargetDatum,
  type ColumnTargetGeometryDatum,
} from "./schema";

export type ColumnTargetChartProps = {
  data?: readonly ColumnTargetDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  actualName?: string;
  targetName?: string;
  unit?: string;
};
export const resolveColumnTargetAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
export const formatColumnTargetLabel = (label: string, maximum = 11) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatColumnTargetValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const formatColumnTargetDelta = (delta: number | null, unit = "") =>
  delta === null
    ? "N/A"
    : delta === 0
      ? "ON TARGET"
      : `${formatColumnTargetValue(Math.abs(delta))}${unit} ${delta > 0 ? "ABOVE" : "BELOW"}`;

type BarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ColumnTargetGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
};
function ActualColumn({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  theme,
}: BarShapeProps) {
  if (!payload || payload.actual === null) return null;
  const motion = getColumnTargetMotion(
      theme.key,
      Boolean(payload.animate),
      payload.index,
    ).marker,
    rect = normalizeColumnTargetRect(y, height),
    color = payload.focus
      ? theme.primary
      : theme.key === "signal"
        ? theme.secondary
        : theme.primary;
  return (
    <g
      data-column-target-bar={payload.label}
      data-actual={payload.actual}
      data-focus={payload.focus ? "true" : "false"}
      style={{ opacity: motion.initialOpacity }}
    >
      {motion.enabled ? (
        <animate
          data-mav-entry="column-target-bar"
          attributeName="opacity"
          from="0"
          to="1"
          dur={`${motion.duration}ms`}
          begin={`${motion.delay}ms`}
          fill="freeze"
        />
      ) : null}
      <rect
        data-column-target-rect
        x={x + 1}
        y={rect.y}
        width={Math.max(0, width - 2)}
        height={rect.height}
        fill={color}
        rx={theme.radius.mark}
      />
    </g>
  );
}

type TargetDotProps = {
  cx?: number;
  cy?: number;
  payload?: ColumnTargetGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
};
function TargetMarker({ cx = 0, cy = 0, payload, theme }: TargetDotProps) {
  if (!payload || payload.target === null) return null;
  const motion = getColumnTargetMotion(
      theme.key,
      Boolean(payload.animate),
      payload.index,
    ).marker,
    color = theme.key === "signal" ? theme.tertiary : theme.tertiary;
  return (
    <g
      data-column-target-marker={payload.label}
      data-target={payload.target}
      data-focus={payload.focus ? "true" : "false"}
      style={{ opacity: motion.initialOpacity }}
    >
      {motion.enabled ? (
        <animate
          data-mav-entry="column-target-marker"
          attributeName="opacity"
          from="0"
          to="1"
          dur={`${motion.duration}ms`}
          begin={`${motion.delay}ms`}
          fill="freeze"
        />
      ) : null}
      <line
        x1={cx - 20}
        x2={cx + 20}
        y1={cy}
        y2={cy}
        stroke={theme.background}
        strokeWidth={6}
      />
      <line
        data-column-target-marker-line
        x1={cx - 20}
        x2={cx + 20}
        y1={cy}
        y2={cy}
        stroke={color}
        strokeWidth={2.5}
      />
    </g>
  );
}

function ColumnTargetTooltip({
  active,
  payload,
  theme,
  actualName,
  targetName,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: ColumnTargetGeometryDatum }[];
  theme: VisualSystemTokens;
  actualName: string;
  targetName: string;
  unit: string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return (
    <div
      data-column-target-tooltip
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
        {actualName}:{" "}
        {datum.actual === null
          ? "Missing"
          : `${formatColumnTargetValue(datum.actual)}${unit}`}
      </div>
      <div>
        {targetName}:{" "}
        {datum.target === null
          ? "Missing"
          : `${formatColumnTargetValue(datum.target)}${unit}`}
      </div>
      <div>
        Delta actual − target: {formatColumnTargetDelta(datum.delta, unit)}
      </div>
      {datum.detail ? (
        <small style={{ color: theme.muted }}>{datum.detail}</small>
      ) : null}
    </div>
  );
}

export function ColumnTargetGeometry({
  data,
  theme,
  animate = true,
  actualName = "Actual",
  targetName = "Target",
  unit = "K",
}: {
  data: readonly ColumnTargetDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  actualName?: string;
  targetName?: string;
  unit?: string;
}) {
  const domain = getColumnTargetDomain(data),
    geometry = buildColumnTargetGeometry(data).map((datum) => ({
      ...datum,
      animate,
    })),
    barMotion = getColumnTargetMotion(theme.key, animate).bar;
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null),
    active = keyboardIndex === null ? null : geometry[keyboardIndex],
    focus = geometry.find((datum) => datum.focus);
  const markerColor = theme.tertiary;
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !geometry.length ||
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    setKeyboardIndex((current) =>
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
      aria-label="Column and target interactive chart"
      data-column-target-animation={animate ? "true" : "false"}
      data-column-target-domain={`${domain[0]},${domain[1]}`}
      tabIndex={0}
      onFocus={() => setKeyboardIndex((current) => current ?? 0)}
      onBlur={() => setKeyboardIndex(null)}
      onKeyDown={onKeyDown}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        outline: "none",
        display: "grid",
        gridTemplateRows: "auto minmax(0, 1fr)",
      }}
    >
      <div
        data-column-target-overlay
        style={{
          display: "grid",
          gap: 4,
          padding: "12px 8px 4px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div
          role="list"
          aria-label="Actual and target legend"
          data-column-target-legend
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: theme.legend.gap,
            color: theme.muted,
            fontSize: theme.legend.fontSize,
          }}
        >
          <span
            role="listitem"
            style={{
              color: theme.key === "signal" ? theme.secondary : theme.primary,
            }}
          >
            ■ {actualName} · {unit || "VALUE"}
          </span>
          <span role="listitem" style={{ color: markerColor }}>
            ━ {targetName} marker · SAME UNIT / SAME AXIS
          </span>
          <span role="listitem">Δ = ACTUAL − TARGET</span>
          <span role="listitem">Missing = no mark</span>
        </div>
        <div
          data-column-target-direct
          style={{
            display: "flex",
            justifyContent: "flex-end",
            color: theme.text,
            fontSize: theme.label.fontSize,
            fontWeight: theme.label.fontWeight,
          }}
        >
          {focus ? (
            <span data-column-target-direct-focus>
              LARGEST GAP · {focus.label.toUpperCase()} ·{" "}
              {formatColumnTargetDelta(focus.delta, unit)}
            </span>
          ) : (
            <span data-column-target-direct-focus>
              ALL COMPARABLE VALUES ON TARGET
            </span>
          )}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={geometry}
          margin={{ top: 18, right: 18, bottom: 10, left: 0 }}
          accessibilityLayer
        >
          <CartesianGrid
            vertical={false}
            stroke={theme.grid}
            strokeDasharray={theme.chart.gridDash}
          />
          <XAxis
            dataKey="label"
            interval="preserveStartEnd"
            minTickGap={10}
            tickFormatter={(label) => formatColumnTargetLabel(String(label))}
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
            tickFormatter={(value) => formatColumnTargetValue(Number(value))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={48}
          />
          <ReferenceLine y={0} stroke={theme.muted} strokeWidth={1.2} />
          <Tooltip
            cursor={{ fill: theme.grid, opacity: 0.16 }}
            content={({ active: tooltipActive, payload }) => (
              <ColumnTargetTooltip
                active={tooltipActive}
                payload={
                  payload as unknown as readonly {
                    payload?: ColumnTargetGeometryDatum;
                  }[]
                }
                theme={theme}
                actualName={actualName}
                targetName={targetName}
                unit={unit}
              />
            )}
          />
          <Bar
            dataKey="actual"
            name={`${actualName} (${unit})`}
            maxBarSize={58}
            shape={(props: unknown) => (
              <ActualColumn
                {...(props as Omit<BarShapeProps, "theme">)}
                theme={theme}
              />
            )}
            {...barMotion}
          />
          <Line
            dataKey="target"
            name={`${targetName} (${unit})`}
            type="linear"
            stroke="none"
            connectNulls={false}
            isAnimationActive={false}
            dot={(props: unknown) => (
              <TargetMarker
                {...(props as Omit<TargetDotProps, "theme">)}
                theme={theme}
              />
            )}
            activeDot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {active ? (
        <div
          role="status"
          data-column-target-keyboard-tooltip
          style={{
            position: "absolute",
            zIndex: 5,
            right: 8,
            bottom: 4,
            maxWidth: "78%",
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.label}: {actualName}{" "}
          {active.actual === null
            ? "missing"
            : `${formatColumnTargetValue(active.actual)}${unit}`}
          ; {targetName}{" "}
          {active.target === null
            ? "missing"
            : `${formatColumnTargetValue(active.target)}${unit}`}
          ; delta {formatColumnTargetDelta(active.delta, unit)}
          {active.focus ? "; first largest absolute gap" : ""}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Actual values and same-unit targets"
        rows={geometry}
        columns={[
          { key: "label", label: "Category", value: (row) => row.label },
          {
            key: "actual",
            label: `${actualName} (${unit})`,
            value: (row) => row.actual ?? "Missing",
          },
          {
            key: "target",
            label: `${targetName} (${unit})`,
            value: (row) => row.target ?? "Missing",
          },
          {
            key: "delta",
            label: "Delta actual minus target",
            value: (row) => row.delta ?? "N/A",
          },
          {
            key: "focus",
            label: "Focus",
            value: (row) => (row.focus ? "First largest absolute gap" : "No"),
          },
        ]}
      />
    </div>
  );
}

export function ColumnTargetChart({
  data = columnTargetExample,
  visualSystem = "signal",
  animate,
  title = "Team one carries the largest target gap",
  subtitle = "ACTUAL K · TARGET K · SHARED ZERO-INCLUSIVE AXIS",
  actualName = "Actual",
  targetName = "Target",
  unit = "K",
}: ColumnTargetChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateColumnTargetData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="B02"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · COLUMN + TARGET`}
      theme={theme}
      state={state}
      description="Actual columns and exact target markers in the same unit on one zero-inclusive unbroken axis."
    >
      <ColumnTargetGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveColumnTargetAnimation(
          animate,
          usePrefersReducedMotion(),
        )}
        actualName={actualName}
        targetName={targetName}
        unit={unit}
      />
    </ChartShell>
  );
}

export {
  buildColumnTargetGeometry,
  getColumnTargetDomain,
  mapColumnTargetY,
  normalizeColumnTargetRect,
  validateColumnTargetData,
} from "./schema";
export type {
  ColumnTargetDatum,
  ColumnTargetDomain,
  ColumnTargetGeometryDatum,
} from "./schema";
export { columnTargetExample, columnTargetEdgeCases } from "./example-data";
export { columnTargetMetadata } from "./metadata";
