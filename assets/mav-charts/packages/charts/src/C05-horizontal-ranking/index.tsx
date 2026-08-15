import { useState, type KeyboardEvent } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { horizontalRankingExample } from "./example-data";
import { getHorizontalRankingMotion } from "./motion";
import { buildHorizontalRankingGeometry, getHorizontalRankingDomain, validateHorizontalRankingData, type HorizontalRankingDatum, type HorizontalRankingGeometryDatum } from "./schema";

export type HorizontalRankingChartProps = {
  data?: readonly HorizontalRankingDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  seriesName?: string;
  unit?: string;
};

export const formatHorizontalRankingLabel = (label: string, maximum = 17) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatHorizontalRankingValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return Number(value.toFixed(2)).toString();
};
export const resolveHorizontalRankingAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;
const valueWithUnit = (value: number, unit: string) => `${formatHorizontalRankingValue(value)}${unit ? ` ${unit}` : ""}`;

type RankingShapeProps = {
  x?: number; y?: number; width?: number; height?: number;
  payload?: HorizontalRankingGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  unit: string;
};

function RankingShape({ x = 0, y = 0, width = 0, height = 0, payload, theme, unit }: RankingShapeProps) {
  if (!payload || payload.value === null) return null;
  const rectX = Math.min(x, x + width);
  const rectWidth = Math.abs(width);
  const fill = theme.key === "signal" ? (payload.focus ? theme.primary : theme.secondary) : theme.primary;
  // Keep signed labels on the zero-side end so long ranking ticks never collide
  // with labels placed beyond a negative bar's far-left magnitude endpoint.
  const labelX = rectX + rectWidth + 7;
  return <g data-ranking-bar={payload.label} data-rank={payload.rank} data-original-index={payload.originalIndex}>
    <rect x={rectX} y={y} width={rectWidth} height={Math.max(0, height)} rx={theme.radius.mark} fill={fill} data-focus={payload.focus ? "true" : "false"}>
      {payload.animate ? <animate data-mav-entry="horizontal-ranking" attributeName="opacity" from="0" to="1" dur="0.7s" fill="freeze" /> : null}
    </rect>
    <text data-ranking-value x={labelX} y={y + height / 2 + theme.label.fontSize / 3} textAnchor="start" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight} style={{ pointerEvents: "none" }}>{valueWithUnit(payload.value, unit)}</text>
  </g>;
}

function RankingTick({ x = 0, y = 0, payload, rows, theme }: { x?: number; y?: number; payload?: { value?: string }; rows: readonly HorizontalRankingGeometryDatum[]; theme: VisualSystemTokens }) {
  const datum = rows.find(({ label }) => label === payload?.value);
  if (!datum) return null;
  return <text data-ranking-tick={datum.label} x={x - 7} y={y + theme.label.fontSize / 3} textAnchor="end" fill={datum.focus && theme.key === "signal" ? theme.primary : theme.muted} fontFamily={theme.body} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}><tspan>{datum.rank === null ? "—" : `#${datum.rank}`}</tspan><tspan dx="6">{formatHorizontalRankingLabel(datum.label)}</tspan></text>;
}

function RankingTooltip({ active, payload, theme, seriesName, unit }: { active?: boolean; payload?: readonly { payload?: HorizontalRankingGeometryDatum }[]; theme: VisualSystemTokens; seriesName: string; unit: string }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>Rank: {datum.rank ?? "Missing"}</div><div>{seriesName}: {datum.value === null ? "Missing" : valueWithUnit(datum.value, unit)}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function HorizontalRankingGeometry({ data, theme, animate = true, seriesName = "Value", unit = "" }: { data: readonly HorizontalRankingDatum[]; theme: VisualSystemTokens; animate?: boolean; seriesName?: string; unit?: string }) {
  const domain = getHorizontalRankingDomain(data);
  const motion = getHorizontalRankingMotion(theme.key, animate);
  const geometry = buildHorizontalRankingGeometry(data).map((datum) => ({ ...datum, animate }));
  const hasNegative = geometry.some(({ value }) => value !== null && value < 0);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!geometry.length || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.length - 1;
      const start = current ?? 0;
      return event.key === "ArrowDown" ? (start + 1) % geometry.length : (start - 1 + geometry.length) % geometry.length;
    });
  };
  return <div role="group" aria-label="Horizontal ranking interactive chart" data-animation-enabled={animate ? "true" : "false"} data-ranking-animation={motion.isAnimationActive ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Horizontal ranking legend" data-ranking-legend style={{ position: "absolute", zIndex: 2, top: 2, left: 8, display: "flex", flexWrap: "wrap", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      {theme.key === "signal" ? <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.primary }} />Rank 1 focus</span> : null}
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.key === "signal" ? theme.secondary : theme.primary }} />{seriesName}{unit ? ` · ${unit}` : ""}</span>
      <span role="listitem">Missing = unranked row</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={geometry} layout="vertical" margin={{ top: 48, right: 72, left: 6, bottom: 8 }} accessibilityLayer>
        <CartesianGrid horizontal={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis type="number" domain={[...domain]} tickFormatter={(value) => formatHorizontalRankingValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey="label" interval={0} width={142} tick={(props: unknown) => <RankingTick {...(props as { x?: number; y?: number; payload?: { value?: string } })} rows={geometry} theme={theme} />} axisLine={false} tickLine={false} />
        {hasNegative ? <ReferenceLine x={0} stroke={theme.tertiary} strokeWidth={1.4} /> : null}
        <Tooltip cursor={{ fill: theme.grid, opacity: 0.2 }} content={({ active: tooltipActive, payload }) => <RankingTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: HorizontalRankingGeometryDatum }[]} theme={theme} seriesName={seriesName} unit={unit} />} />
        <Bar dataKey="value" name={seriesName} maxBarSize={56} shape={(props: unknown) => <RankingShape {...(props as Omit<RankingShapeProps, "theme" | "unit">)} theme={theme} unit={unit} />} {...motion} />
      </BarChart>
    </ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "82%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.rank === null ? "Missing rank" : `Rank ${active.rank}`}: {active.label}; {seriesName} {active.value === null ? "missing" : valueWithUnit(active.value, unit)}{active.detail ? `; ${active.detail}` : ""}</div> : null}
    <AccessibleDataTable caption="Horizontal ranking values" rows={geometry} columns={[{ key: "rank", label: "Rank", value: (datum) => datum.rank ?? "Missing" }, { key: "label", label: "Category", value: (datum) => datum.label }, { key: "value", label: `${seriesName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.value ?? "Missing" }, { key: "detail", label: "Detail", value: (datum) => datum.detail ?? "" }]} />
  </div>;
}

export function HorizontalRankingChart({ data = horizontalRankingExample, visualSystem = "signal", animate, title = "Enterprise holds a clear lead", subtitle = "RANKED DESCENDING · CURRENT SCORE", seriesName = "Value", unit = "" }: HorizontalRankingChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveHorizontalRankingAnimation(animate, reducedMotion);
  const validation = validateHorizontalRankingData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  const safeData = validation.valid ? data : [];
  return <ChartShell code="C05" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · HORIZONTAL RANKING`} theme={theme} state={state} description="Finite values sorted descending with stable ties, explicit ranks, signed zero baseline and unranked missing rows."><HorizontalRankingGeometry data={safeData} theme={theme} animate={shouldAnimate} seriesName={seriesName} unit={unit} /></ChartShell>;
}

export { buildHorizontalRankingGeometry, getHorizontalRankingDomain, getHorizontalRankingLength, mapHorizontalRankingX, validateHorizontalRankingData } from "./schema";
export type { HorizontalRankingDatum, HorizontalRankingGeometryDatum } from "./schema";
export { horizontalRankingExample, horizontalRankingEdgeCases } from "./example-data";
export { horizontalRankingMetadata } from "./metadata";
