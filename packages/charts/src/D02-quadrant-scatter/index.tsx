import { useState, type KeyboardEvent } from "react";
import {
  CartesianGrid,
  ReferenceLine,
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
import {
  quadrantScatterExample,
  quadrantScatterThresholds,
} from "./example-data";
import { getQuadrantScatterMotion } from "./motion";
import {
  buildQuadrantScatterGeometry,
  classifyQuadrant,
  getQuadrantScatterDomains,
  validateQuadrantScatterData,
  validateQuadrantScatterThresholds,
  type QuadrantName,
  type QuadrantScatterDatum,
  type QuadrantScatterGeometryDatum,
  type QuadrantScatterThresholds,
} from "./schema";

export type QuadrantScatterChartProps = {
  data?: readonly QuadrantScatterDatum[];
  thresholdX?: number;
  thresholdY?: number;
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  xName?: string;
  yName?: string;
};
const names: Record<QuadrantName, string> = {
  "upper-right": "Upper right",
  "upper-left": "Upper left",
  "lower-left": "Lower left",
  "lower-right": "Lower right",
  boundary: "On boundary",
};
export const formatQuadrantScatterLabel = (label: string, max = 14) =>
  label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
export const formatQuadrantScatterValue = (value: number) => {
  const a = Math.abs(value);
  if (a >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (a >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (a >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(4)).toString();
};
export const resolveQuadrantScatterAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;

type ShapeProps = {
  cx?: number;
  cy?: number;
  payload?: QuadrantScatterGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
};
function PointShape({ cx = 0, cy = 0, payload, theme }: ShapeProps) {
  if (!payload) return null;
  const color = payload.focused
    ? theme.primary
    : theme.key === "signal"
      ? theme.text
      : theme.secondary;
  return (
    <g
      data-quadrant-point={payload.label}
      data-quadrant={payload.quadrant}
      data-focused={payload.focused ? "true" : "false"}
      data-true-x={payload.x}
      data-true-y={payload.y}
    >
      <circle
        cx={cx}
        cy={cy}
        r={payload.focused ? 7 : 5}
        fill={color}
        stroke={theme.background}
        strokeWidth={1.5}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="quadrant-scatter"
            attributeName="r"
            from="0"
            to={payload.focused ? "7" : "5"}
            dur=".65s"
            fill="freeze"
          />
        ) : null}
      </circle>
      <text
        data-quadrant-label
        x={cx + payload.labelDx}
        y={cy + payload.labelDy}
        textAnchor={payload.labelAnchor}
        fill={payload.focused ? theme.primary : theme.muted}
        fontSize={theme.label.fontSize}
        fontWeight={theme.label.fontWeight}
      >
        {formatQuadrantScatterLabel(payload.label)}
      </text>
    </g>
  );
}

function Tip({
  active,
  payload,
  theme,
  xName,
  yName,
}: {
  active?: boolean;
  payload?: readonly { payload?: QuadrantScatterGeometryDatum }[];
  theme: VisualSystemTokens;
  xName: string;
  yName: string;
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
      <div>
        {xName}: {formatQuadrantScatterValue(d.x)}
      </div>
      <div>
        {yName}: {formatQuadrantScatterValue(d.y)}
      </div>
      <small style={{ color: theme.muted }}>
        {names[d.quadrant]}
        {d.detail ? ` · ${d.detail}` : ""}
      </small>
    </div>
  );
}

export function QuadrantScatterGeometry({
  data,
  thresholds = quadrantScatterThresholds,
  theme,
  animate = true,
  xName = "X",
  yName = "Y",
}: {
  data: readonly QuadrantScatterDatum[];
  thresholds?: QuadrantScatterThresholds;
  theme: VisualSystemTokens;
  animate?: boolean;
  xName?: string;
  yName?: string;
}) {
  const geometry = buildQuadrantScatterGeometry(data, thresholds).map((d) => ({
      ...d,
      animate,
    })),
    domains = getQuadrantScatterDomains(data, thresholds),
    [activeIndex, setActiveIndex] = useState<number | null>(null),
    active = activeIndex === null ? null : geometry[activeIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !geometry.length ||
      ![
        "ArrowRight",
        "ArrowLeft",
        "ArrowDown",
        "ArrowUp",
        "Home",
        "End",
      ].includes(event.key)
    )
      return;
    event.preventDefault();
    setActiveIndex((current) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? geometry.length - 1
          : ["ArrowRight", "ArrowDown"].includes(event.key)
            ? ((current ?? 0) + 1) % geometry.length
            : ((current ?? 0) - 1 + geometry.length) % geometry.length,
    );
  };
  const tableRows = data.map((d, index) => ({
    ...d,
    index,
    quadrant:
      typeof d.x === "number" &&
      Number.isFinite(d.x) &&
      typeof d.y === "number" &&
      Number.isFinite(d.y)
        ? classifyQuadrant(d.x, d.y, thresholds)
        : null,
  }));
  return (
    <div
      role="group"
      aria-label="Quadrant scatter interactive chart"
      data-quadrant-animation={animate ? "true" : "false"}
      data-threshold-x={thresholds.x}
      data-threshold-y={thresholds.y}
      data-x-domain-min={domains.x[0]}
      data-x-domain-max={domains.x[1]}
      data-y-domain-min={domains.y[0]}
      data-y-domain-max={domains.y[1]}
      data-visible-points={geometry.length}
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
        aria-label="Quadrant scatter legend"
        data-quadrant-legend
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
          ● Focus
        </span>
        <span
          role="listitem"
          style={{
            color: theme.key === "signal" ? theme.text : theme.secondary,
          }}
        >
          ● Context
        </span>
        <span role="listitem">Dashed = thresholds</span>
      </div>
      <div
        aria-hidden="true"
        data-quadrant-regions
        style={{
          position: "absolute",
          zIndex: 1,
          inset: "72px 28px 42px 62px",
          pointerEvents: "none",
          color: theme.muted,
          opacity: 0.45,
          fontSize: theme.label.fontSize,
          fontWeight: theme.label.fontWeight,
        }}
      >
        <span style={{ position: "absolute", top: 4, left: 4 }}>
          UPPER LEFT
        </span>
        <span style={{ position: "absolute", top: 4, right: 4 }}>
          UPPER RIGHT
        </span>
        <span style={{ position: "absolute", bottom: 4, left: 4 }}>
          LOWER LEFT
        </span>
        <span style={{ position: "absolute", bottom: 4, right: 4 }}>
          LOWER RIGHT
        </span>
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart
          margin={{ top: 58, right: 42, left: 0, bottom: 12 }}
          accessibilityLayer
        >
          <CartesianGrid
            stroke={theme.grid}
            strokeDasharray={theme.chart.gridDash}
          />
          <XAxis
            type="number"
            dataKey="x"
            domain={[...domains.x]}
            tickFormatter={(v) => formatQuadrantScatterValue(Number(v))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="number"
            dataKey="y"
            domain={[...domains.y]}
            tickFormatter={(v) => formatQuadrantScatterValue(Number(v))}
            tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
            axisLine={false}
            tickLine={false}
            width={58}
          />
          <ReferenceLine
            data-threshold-line="x"
            x={thresholds.x}
            stroke={theme.key === "signal" ? theme.text : theme.muted}
            strokeWidth={1.5}
            strokeDasharray="8 8"
          />
          <ReferenceLine
            data-threshold-line="y"
            y={thresholds.y}
            stroke={theme.key === "signal" ? theme.text : theme.muted}
            strokeWidth={1.5}
            strokeDasharray="8 8"
          />
          <Tooltip
            cursor={{ stroke: theme.muted, strokeDasharray: "4 4" }}
            content={({ active: ta, payload }) => (
              <Tip
                active={ta}
                payload={
                  payload as unknown as readonly {
                    payload?: QuadrantScatterGeometryDatum;
                  }[]
                }
                theme={theme}
                xName={xName}
                yName={yName}
              />
            )}
          />
          <Scatter
            data={geometry}
            shape={(p: unknown) => (
              <PointShape {...(p as Omit<ShapeProps, "theme">)} theme={theme} />
            )}
            {...getQuadrantScatterMotion(theme.key, animate)}
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
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.label}: {xName} {formatQuadrantScatterValue(active.x)};{" "}
          {yName} {formatQuadrantScatterValue(active.y)};{" "}
          {names[active.quadrant]}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Quadrant scatter values"
        rows={tableRows}
        columns={[
          { key: "label", label: "Item", value: (r) => r.label },
          { key: "x", label: xName, value: (r) => r.x ?? "Missing" },
          { key: "y", label: yName, value: (r) => r.y ?? "Missing" },
          {
            key: "quadrant",
            label: "Quadrant",
            value: (r) =>
              r.quadrant ? names[r.quadrant] : "Missing whole point",
          },
          { key: "detail", label: "Detail", value: (r) => r.detail ?? "" },
        ]}
      />
    </div>
  );
}

export function QuadrantScatterChart({
  data = quadrantScatterExample,
  thresholdX = quadrantScatterThresholds.x,
  thresholdY = quadrantScatterThresholds.y,
  visualSystem = "signal",
  animate,
  title = "Nova leads both dimensions",
  subtitle = "TWO MEASURES · EXPLICIT THRESHOLDS",
  xName = "Reach",
  yName = "Momentum",
}: QuadrantScatterChartProps) {
  const theme = getVisualSystem(visualSystem),
    thresholds = { x: thresholdX, y: thresholdY },
    dataValidation = validateQuadrantScatterData(data),
    thresholdValidation = validateQuadrantScatterThresholds(thresholds),
    valid = dataValidation.valid && thresholdValidation.valid,
    state = data.length === 0 ? "empty" : valid ? "ready" : "invalid",
    safeThresholds = thresholdValidation.valid
      ? thresholds
      : quadrantScatterThresholds;
  return (
    <ChartShell
      code="D02"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · QUADRANT SCATTER`}
      theme={theme}
      state={state}
      description="Two numeric coordinates positioned against explicit thresholds; labels may move, but point coordinates remain true."
    >
      <QuadrantScatterGeometry
        data={valid ? data : []}
        thresholds={safeThresholds}
        theme={theme}
        animate={resolveQuadrantScatterAnimation(
          animate,
          usePrefersReducedMotion(),
        )}
        xName={xName}
        yName={yName}
      />
    </ChartShell>
  );
}
export {
  buildQuadrantScatterGeometry,
  classifyQuadrant,
  getQuadrantScatterDomains,
  mapQuadrantScatterX,
  mapQuadrantScatterY,
  validateQuadrantScatterData,
  validateQuadrantScatterThresholds,
} from "./schema";
export type {
  QuadrantName,
  QuadrantScatterDatum,
  QuadrantScatterGeometryDatum,
  QuadrantScatterThresholds,
} from "./schema";
export {
  quadrantScatterExample,
  quadrantScatterEdgeCases,
  quadrantScatterThresholds,
} from "./example-data";
export { quadrantScatterMetadata } from "./metadata";
