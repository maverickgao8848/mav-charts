import { useState, type KeyboardEvent } from "react";
import { Pie, PieChart, ResponsiveContainer, Sector, Tooltip } from "recharts";
import {
  getVisualSystem,
  type VisualSystemId,
  type VisualSystemTokens,
} from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { pieExample } from "./example-data";
import { getPieMotion } from "./motion";
import {
  buildPieGeometry,
  validatePieData,
  type PieDatum,
  type PieGeometryDatum,
} from "./schema";

export type PieCompositionChartProps = {
  data?: readonly PieDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  unit?: string;
};
export const resolvePieAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
export const formatPieLabel = (label: string, maximum = 24) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatPieValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(4)).toString();
};
export const formatPiePercent = (share: number | null) =>
  share === null ? "N/A" : `${Number((share * 100).toFixed(1))}%`;

const contextColors = (theme: VisualSystemTokens) =>
  [theme.secondary, theme.fourth, theme.tertiary, theme.muted] as const;

type SliceProps = {
  cx?: number;
  cy?: number;
  innerRadius?: number;
  outerRadius?: number;
  startAngle?: number;
  endAngle?: number;
  payload?: PieGeometryDatum & { fill?: string; animate?: boolean };
  theme: VisualSystemTokens;
};
function PieSlice({
  cx = 0,
  cy = 0,
  innerRadius = 0,
  outerRadius = 0,
  startAngle = 0,
  endAngle = 0,
  payload,
  theme,
}: SliceProps) {
  if (!payload || payload.value === null || payload.value === 0) return null;
  const motion = getPieMotion(
    theme.key,
    Boolean(payload.animate),
    payload.index,
  );
  return (
    <g
      data-pie-slice={payload.label}
      data-stage-index={payload.index}
      data-value={payload.value}
      data-share={payload.share}
      data-start-angle={payload.startAngle}
      data-end-angle={payload.endAngle}
      data-angle={payload.angle}
      data-focus={payload.focus ? "true" : "false"}
      style={{ opacity: motion.initialOpacity }}
    >
      {motion.enabled ? (
        <animate
          data-mav-entry="pie-slice"
          attributeName="opacity"
          from="0"
          to="1"
          dur={`${motion.duration}ms`}
          begin={`${motion.delay}ms`}
          fill="freeze"
        />
      ) : null}
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={payload.fill}
        stroke={theme.background}
        strokeWidth={3}
      />
    </g>
  );
}

function PieDirectLabel({
  cx = 0,
  cy = 0,
  midAngle = 0,
  outerRadius = 0,
  payload,
}: {
  cx?: number;
  cy?: number;
  midAngle?: number;
  outerRadius?: number;
  payload?: PieGeometryDatum;
}) {
  if (!payload || payload.share === null || payload.share <= 0) return null;
  const radius = outerRadius * 0.62,
    radians = (-midAngle * Math.PI) / 180;
  return (
    <text
      data-pie-direct-label={payload.label}
      x={cx + radius * Math.cos(radians)}
      y={cy + radius * Math.sin(radians)}
      textAnchor="middle"
      dominantBaseline="central"
      fill={payload.focus ? "#050504" : "currentColor"}
      fontSize={12}
      fontWeight={900}
      style={{ pointerEvents: "none" }}
    >
      {formatPiePercent(payload.share)}
    </text>
  );
}

function PieTooltip({
  active,
  payload,
  theme,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: PieGeometryDatum }[];
  theme: VisualSystemTokens;
  unit: string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return (
    <div
      data-pie-tooltip
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
        Value:{" "}
        {datum.value === null
          ? "Missing"
          : `${formatPieValue(datum.value)}${unit}`}
      </div>
      <div>Share of known total: {formatPiePercent(datum.share)}</div>
      {datum.detail ? (
        <small style={{ color: theme.muted }}>{datum.detail}</small>
      ) : null}
    </div>
  );
}

export function PieCompositionGeometry({
  data,
  theme,
  animate = true,
  unit = "",
}: {
  data: readonly PieDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  unit?: string;
}) {
  const context = contextColors(theme);
  let contextIndex = 0;
  const geometry = buildPieGeometry(data).map((datum) => ({
    ...datum,
    animate,
    fill: datum.focus
      ? theme.primary
      : context[contextIndex++ % context.length],
  }));
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null),
    active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !geometry.length ||
      ![
        "ArrowDown",
        "ArrowUp",
        "ArrowRight",
        "ArrowLeft",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    setKeyboardIndex((current) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? geometry.length - 1
          : ["ArrowDown", "ArrowRight"].includes(event.key)
            ? ((current ?? 0) + 1) % geometry.length
            : ((current ?? 0) - 1 + geometry.length) % geometry.length,
    );
  };
  const describe = (datum: PieGeometryDatum) =>
    `${datum.label}: ${datum.value === null ? "Missing; share N/A" : `${formatPieValue(datum.value)}${unit}; ${formatPiePercent(datum.share)} of known total`}${datum.focus ? "; first positive focus" : ""}`;
  return (
    <div
      role="group"
      aria-label="Pie composition interactive chart"
      data-pie-animation={animate ? "true" : "false"}
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
        gridTemplateColumns: "minmax(0, 1fr) minmax(126px, 31%)",
      }}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart accessibilityLayer>
          <Tooltip
            content={({ active: tooltipActive, payload }) => (
              <PieTooltip
                active={tooltipActive}
                payload={
                  payload as unknown as readonly {
                    payload?: PieGeometryDatum;
                  }[]
                }
                theme={theme}
                unit={unit}
              />
            )}
          />
          <Pie
            data={geometry}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="52%"
            outerRadius="76%"
            startAngle={90}
            endAngle={-270}
            isAnimationActive={animate}
            animationDuration={getPieMotion(theme.key, animate).duration}
            shape={(props: unknown) => (
              <PieSlice
                {...(props as Omit<SliceProps, "theme">)}
                theme={theme}
              />
            )}
            labelLine={false}
            label={(props: unknown) => (
              <PieDirectLabel
                {...(props as Parameters<typeof PieDirectLabel>[0])}
              />
            )}
          />
        </PieChart>
      </ResponsiveContainer>
      <div
        role="list"
        aria-label="Pie legend"
        data-pie-legend
        style={{
          alignSelf: "center",
          display: "grid",
          gap: theme.legend.gap,
          color: theme.text,
          fontSize: theme.legend.fontSize,
        }}
      >
        {geometry.map((datum) => (
          <span
            role="listitem"
            key={datum.label}
            title={datum.label}
            data-pie-legend-item={datum.label}
            style={{
              display: "grid",
              gridTemplateColumns: `${theme.legend.iconSize}px minmax(0, 1fr) auto`,
              alignItems: "center",
              gap: 6,
            }}
          >
            <i
              aria-hidden="true"
              style={{
                width: theme.legend.iconSize,
                height: theme.legend.iconSize,
                background: datum.value === null ? "transparent" : datum.fill,
                border: `1px ${datum.value === null ? "dashed" : "solid"} ${datum.value === null ? theme.muted : datum.fill}`,
              }}
            />
            <span
              style={{
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {formatPieLabel(datum.label)}
            </span>
            <strong>
              {datum.value === null ? "Missing" : formatPiePercent(datum.share)}
            </strong>
          </span>
        ))}
        <small style={{ color: theme.muted }}>
          ANGLE = SHARE OF KNOWN TOTAL
        </small>
      </div>
      {active ? (
        <div
          role="status"
          data-pie-keyboard-tooltip
          style={{
            position: "absolute",
            zIndex: 4,
            right: 8,
            bottom: 4,
            maxWidth: "72%",
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {describe(active)}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Pie composition data"
        rows={geometry}
        columns={[
          { key: "label", label: "Category", value: (row) => row.label },
          {
            key: "value",
            label: "Value",
            value: (row) => row.value ?? "Missing",
          },
          {
            key: "share",
            label: "Share of known total",
            value: (row) => formatPiePercent(row.share),
          },
          {
            key: "angle",
            label: "Angle degrees",
            value: (row) =>
              row.value === null ? "N/A" : Number(row.angle.toFixed(4)),
          },
          { key: "detail", label: "Detail", value: (row) => row.detail ?? "" },
        ]}
      />
    </div>
  );
}

export function PieCompositionChart({
  data = pieExample,
  visualSystem = "signal",
  animate,
  title = "Core product contributes the largest share",
  subtitle = "MIX OF KNOWN TOTAL · ANGLE = VALUE SHARE",
  unit = "",
}: PieCompositionChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validatePieData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="P01"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · PIE`}
      theme={theme}
      state={state}
      description="A small-part composition chart with angles strictly proportional to non-negative known values."
    >
      <PieCompositionGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolvePieAnimation(animate, usePrefersReducedMotion())}
        unit={unit}
      />
    </ChartShell>
  );
}

export { buildPieGeometry, getPieAngle, validatePieData } from "./schema";
export type { PieDatum, PieGeometryDatum } from "./schema";
export { pieExample, pieEdgeCases } from "./example-data";
export { pieMetadata } from "./metadata";
