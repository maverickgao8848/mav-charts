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
import { columnLineExample } from "./example-data";
import { getColumnLineMotion } from "./motion";
import {
  buildColumnLineGeometry,
  getColumnLineDomains,
  normalizeColumnRect,
  validateColumnLineData,
  type ColumnLineDatum,
  type ColumnLineGeometryDatum,
} from "./schema";

export type ColumnLineChartProps = {
  data?: readonly ColumnLineDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  scaleName?: string;
  scaleUnit?: string;
  rateName?: string;
};
export const resolveColumnLineAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
export const formatColumnLineLabel = (label: string, maximum = 11) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatColumnLineValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};

type BarShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: ColumnLineGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
};
function ColumnShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  payload,
  theme,
}: BarShapeProps) {
  if (!payload || payload.scaleValue === null) return null;
  const entry = getColumnLineMotion(
      theme.key,
      Boolean(payload.animate),
      payload.index,
    ).entry,
    rect = normalizeColumnRect(y, height);
  return (
    <g
      data-column-line-bar={payload.label}
      data-scale-value={payload.scaleValue}
      data-peak-scale={payload.peakScale ? "true" : "false"}
      style={{ opacity: entry.initialOpacity }}
    >
      {entry.enabled ? (
        <animate
          data-mav-entry="column-line-bar"
          attributeName="opacity"
          from="0"
          to="1"
          dur={`${entry.duration}ms`}
          begin={`${entry.delay}ms`}
          fill="freeze"
        />
      ) : null}
      <rect
        data-column-line-rect
        x={x + 1}
        y={rect.y}
        width={Math.max(0, width - 2)}
        height={rect.height}
        fill={theme.key === "signal" ? theme.secondary : theme.primary}
        rx={theme.radius.mark}
      />
    </g>
  );
}

type DotProps = {
  cx?: number;
  cy?: number;
  payload?: ColumnLineGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  color: string;
};
function RateDot({ cx = 0, cy = 0, payload, theme, color }: DotProps) {
  if (!payload || payload.ratePercent === null) return null;
  const entry = getColumnLineMotion(
    theme.key,
    Boolean(payload.animate),
    payload.index,
  ).entry;
  return (
    <circle
      data-column-line-dot={payload.label}
      data-rate-percent={payload.ratePercent}
      data-latest-rate={payload.latestRate ? "true" : "false"}
      cx={cx}
      cy={cy}
      r={4}
      fill={color}
      stroke={theme.background}
      strokeWidth={1.5}
      style={{ opacity: entry.initialOpacity }}
    >
      {entry.enabled ? (
        <animate
          data-mav-entry="column-line-dot"
          attributeName="opacity"
          from="0"
          to="1"
          dur={`${entry.duration}ms`}
          begin={`${entry.delay}ms`}
          fill="freeze"
        />
      ) : null}
    </circle>
  );
}

function ColumnLineTooltip({
  active,
  payload,
  theme,
  scaleName,
  scaleUnit,
  rateName,
}: {
  active?: boolean;
  payload?: readonly { payload?: ColumnLineGeometryDatum }[];
  theme: VisualSystemTokens;
  scaleName: string;
  scaleUnit: string;
  rateName: string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return (
    <div
      data-column-line-tooltip
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
        {scaleName}:{" "}
        {datum.scaleValue === null
          ? "Missing"
          : `${formatColumnLineValue(datum.scaleValue)}${scaleUnit}`}
      </div>
      <div>
        {rateName}:{" "}
        {datum.ratePercent === null
          ? "Missing"
          : `${formatColumnLineValue(datum.ratePercent)}%`}
      </div>
      {datum.detail ? (
        <small style={{ color: theme.muted }}>{datum.detail}</small>
      ) : null}
    </div>
  );
}

export function ColumnLineGeometry({
  data,
  theme,
  animate = true,
  scaleName = "Orders",
  scaleUnit = "K",
  rateName = "Conversion",
}: {
  data: readonly ColumnLineDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  scaleName?: string;
  scaleUnit?: string;
  rateName?: string;
}) {
  const domains = getColumnLineDomains(data),
    lineColor = theme.key === "signal" ? theme.primary : theme.secondary;
  const geometry = buildColumnLineGeometry(data).map((datum) => ({
      ...datum,
      animate,
    })),
    motion = getColumnLineMotion(theme.key, animate);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null),
    active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const peak = geometry.find(({ peakScale }) => peakScale),
    latest = geometry.find(({ latestRate }) => latestRate);
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
      aria-label="Column and percentage line interactive chart"
      data-column-line-animation={animate ? "true" : "false"}
      data-scale-domain={`${domains.scale[0]},${domains.scale[1]}`}
      data-rate-domain="0,100"
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
        data-column-line-overlay
        style={{
          display: "grid",
          gap: 4,
          padding: "0 8px 4px",
          position: "relative",
          zIndex: 3,
        }}
      >
        <div
          role="list"
          aria-label="Scale and bounded rate legend"
          data-column-line-legend
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
            ■ {scaleName} · LEFT · {scaleUnit || "VALUE"} · ZERO-BASED
          </span>
          <span role="listitem" style={{ color: lineColor }}>
            ━ {rateName} · RIGHT · % · FIXED 0–100
          </span>
          <span role="listitem">POSITIONS ARE NOT EQUAL VALUES</span>
        </div>
        <div
          data-column-line-direct
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "flex-end",
            gap: "2px 12px",
            color: theme.text,
            fontSize: theme.label.fontSize,
            fontWeight: theme.label.fontWeight,
          }}
        >
          {peak ? (
            <span data-column-line-direct-peak>
              PEAK {scaleName.toUpperCase()} ·{" "}
              {formatColumnLineValue(peak.scaleValue!)}
              {scaleUnit}
            </span>
          ) : null}
          {latest ? (
            <span data-column-line-direct-latest>
              LATEST {rateName.toUpperCase()} ·{" "}
              {formatColumnLineValue(latest.ratePercent!)}%
            </span>
          ) : null}
        </div>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart
          data={geometry}
          margin={{ top: 18, right: 16, bottom: 10, left: -2 }}
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
            tickFormatter={(label) => formatColumnLineLabel(String(label))}
            tick={{
              fill: theme.muted,
              fontSize: theme.label.fontSize,
              fontWeight: theme.label.fontWeight,
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="scale"
            domain={[...domains.scale]}
            tickFormatter={(value) => formatColumnLineValue(Number(value))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={46}
          />
          <YAxis
            yAxisId="rate"
            orientation="right"
            domain={[0, 100]}
            ticks={[0, 25, 50, 75, 100]}
            tickFormatter={(value) => `${value}%`}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={42}
            allowDataOverflow
          />
          <ReferenceLine
            yAxisId="scale"
            y={0}
            stroke={theme.muted}
            strokeWidth={1.2}
          />
          <Tooltip
            cursor={{ fill: theme.grid, opacity: 0.16 }}
            content={({ active: tooltipActive, payload }) => (
              <ColumnLineTooltip
                active={tooltipActive}
                payload={
                  payload as unknown as readonly {
                    payload?: ColumnLineGeometryDatum;
                  }[]
                }
                theme={theme}
                scaleName={scaleName}
                scaleUnit={scaleUnit}
                rateName={rateName}
              />
            )}
          />
          <Bar
            yAxisId="scale"
            dataKey="scaleValue"
            name={`${scaleName} (${scaleUnit})`}
            maxBarSize={54}
            shape={(props: unknown) => (
              <ColumnShape
                {...(props as Omit<BarShapeProps, "theme">)}
                theme={theme}
              />
            )}
            {...motion.bar}
          />
          <Line
            className="column-line-rate"
            yAxisId="rate"
            type="monotone"
            dataKey="ratePercent"
            name={`${rateName} (%)`}
            connectNulls={false}
            stroke={lineColor}
            strokeWidth={theme.line.emphasis}
            dot={(props: unknown) => (
              <RateDot
                {...(props as Omit<DotProps, "theme" | "color">)}
                theme={theme}
                color={lineColor}
              />
            )}
            activeDot={{ fill: theme.text, r: 5, strokeWidth: 0 }}
            {...motion.line}
          />
        </ComposedChart>
      </ResponsiveContainer>
      {active ? (
        <div
          role="status"
          data-column-line-keyboard-tooltip
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
          {active.label}: {scaleName}{" "}
          {active.scaleValue === null
            ? "missing"
            : `${formatColumnLineValue(active.scaleValue)}${scaleUnit}`}
          ; {rateName}{" "}
          {active.ratePercent === null
            ? "missing"
            : `${formatColumnLineValue(active.ratePercent)}%`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Absolute scale and bounded percentage rate"
        rows={geometry}
        columns={[
          { key: "label", label: "Period", value: (row) => row.label },
          {
            key: "scale",
            label: `${scaleName} (${scaleUnit}, left zero-based axis)`,
            value: (row) => row.scaleValue ?? "Missing",
          },
          {
            key: "rate",
            label: `${rateName} (%, right fixed 0–100 axis)`,
            value: (row) => row.ratePercent ?? "Missing",
          },
          { key: "detail", label: "Detail", value: (row) => row.detail ?? "" },
        ]}
      />
    </div>
  );
}

export function ColumnLineChart({
  data = columnLineExample,
  visualSystem = "signal",
  animate,
  title = "Scale rose as conversion reached 42%",
  subtitle = "ORDERS K · CONVERSION % · FIXED RATE AXIS",
  scaleName = "Orders",
  scaleUnit = "K",
  rateName = "Conversion",
}: ColumnLineChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateColumnLineData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="B01"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · COLUMN + LINE`}
      theme={theme}
      state={state}
      description="Absolute scale columns on a zero-inclusive left axis with a bounded percentage line on a fixed 0–100 right axis."
    >
      <ColumnLineGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveColumnLineAnimation(animate, usePrefersReducedMotion())}
        scaleName={scaleName}
        scaleUnit={scaleUnit}
        rateName={rateName}
      />
    </ChartShell>
  );
}

export {
  buildColumnLineGeometry,
  getColumnLineDomains,
  mapColumnLineRateY,
  mapColumnLineScaleY,
  normalizeColumnRect,
  validateColumnLineData,
} from "./schema";
export type {
  ColumnLineDatum,
  ColumnLineDomains,
  ColumnLineGeometryDatum,
} from "./schema";
export { columnLineExample, columnLineEdgeCases } from "./example-data";
export { columnLineMetadata } from "./metadata";
