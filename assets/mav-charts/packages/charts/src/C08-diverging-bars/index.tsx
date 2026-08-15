import { useState, type KeyboardEvent } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { divergingBarExample } from "./example-data";
import { getDivergingBarMotion } from "./motion";
import { buildDivergingBarGeometry, getDivergingBarDomain, validateDivergingBarData, type DivergingBarDatum, type DivergingBarGeometryDatum } from "./schema";

export type DivergingBarChartProps = { data?: readonly DivergingBarDatum[]; visualSystem?: VisualSystemId; animate?: boolean; title?: string; subtitle?: string; seriesName?: string; unit?: string };
export const formatDivergingBarLabel = (label: string, maximum = 20) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatDivergingBarValue = (value: number) => { const absolute = Math.abs(value); const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`; if (absolute >= 1e9) return compact(1e9, "B"); if (absolute >= 1e6) return compact(1e6, "M"); if (absolute >= 1e3) return compact(1e3, "K"); return Number(value.toFixed(2)).toString(); };
export const resolveDivergingBarAnimation = (animate: boolean | undefined, reduced: boolean) => animate ?? !reduced;
const withUnit = (value: number, unit: string) => `${formatDivergingBarValue(value)}${unit ? ` ${unit}` : ""}`;

type ShapeProps = { x?: number; y?: number; width?: number; height?: number; payload?: DivergingBarGeometryDatum & { animate?: boolean }; theme: VisualSystemTokens; unit: string };
function DivergingShape({ x = 0, y = 0, width = 0, height = 0, payload, theme, unit }: ShapeProps) {
  if (!payload || payload.value === null) return null;
  const rectX = Math.min(x, x + width), rectWidth = Math.abs(width);
  const fill = theme.key === "signal" ? (payload.focus ? theme.primary : theme.secondary) : theme.primary;
  const labelX = rectX + rectWidth + 7;
  return <g data-diverging-bar={payload.label} data-category-index={payload.index} data-value={payload.value}>
    <rect x={rectX} y={y} width={rectWidth} height={Math.max(0, height)} rx={Math.min(theme.radius.mark, Math.abs(height) / 2)} fill={fill} data-focus={payload.focus ? "true" : "false"}>
      {payload.animate ? <animate data-mav-entry="diverging-bar" attributeName="opacity" from="0" to="1" dur="0.7s" fill="freeze" /> : null}
    </rect>
    <text data-diverging-value x={labelX} y={y + height / 2 + theme.label.fontSize / 3} textAnchor="start" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight} style={{ pointerEvents: "none" }}>{withUnit(payload.value, unit)}</text>
  </g>;
}

function DivergingTick({ x = 0, y = 0, payload, theme }: { x?: number; y?: number; payload?: { value?: string }; theme: VisualSystemTokens }) { const label = String(payload?.value ?? ""); return <text data-diverging-tick={label} x={x - 7} y={y + theme.label.fontSize / 3} textAnchor="end" fill={theme.muted} fontFamily={theme.body} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>{formatDivergingBarLabel(label)}</text>; }
function DivergingTooltip({ active, payload, theme, seriesName, unit }: { active?: boolean; payload?: readonly { payload?: DivergingBarGeometryDatum }[]; theme: VisualSystemTokens; seriesName: string; unit: string }) { const datum = payload?.[0]?.payload; if (!active || !datum) return null; const direction = datum.value === null ? "Missing" : datum.value > 0 ? "Positive" : datum.value < 0 ? "Negative" : "Unchanged"; return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{seriesName}: {datum.value === null ? "Missing" : withUnit(datum.value, unit)}</div><div>Direction: {direction}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>; }

export function DivergingBarGeometry({ data, theme, animate = true, seriesName = "Change", unit = "" }: { data: readonly DivergingBarDatum[]; theme: VisualSystemTokens; animate?: boolean; seriesName?: string; unit?: string }) {
  const domain = getDivergingBarDomain(data); const motion = getDivergingBarMotion(theme.key, animate); const geometry = buildDivergingBarGeometry(data).map((datum) => ({ ...datum, animate })); const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null); const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => { if (!geometry.length || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return; event.preventDefault(); setKeyboardIndex((current) => event.key === "Home" ? 0 : event.key === "End" ? geometry.length - 1 : event.key === "ArrowDown" ? ((current ?? 0) + 1) % geometry.length : ((current ?? 0) - 1 + geometry.length) % geometry.length); };
  return <div role="group" aria-label="Diverging bars interactive chart" data-diverging-animation={motion.isAnimationActive ? "true" : "false"} data-focus-label={geometry.find(({ focus }) => focus)?.label ?? ""} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Diverging bar legend" data-diverging-legend style={{ position: "absolute", zIndex: 2, top: 4, left: 8, display: "flex", flexWrap: "wrap", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>{theme.key === "signal" ? <span role="listitem" style={{ color: theme.primary }}>■ First category focus</span> : null}<span role="listitem">■ {seriesName}{unit ? ` · ${unit}` : ""}</span><span role="listitem">Zero = direction boundary</span><span role="listitem">Missing = gap</span></div>
    <ResponsiveContainer width="100%" height="100%"><BarChart data={geometry} layout="vertical" margin={{ top: 52, right: 90, left: 6, bottom: 8 }} accessibilityLayer>
      <CartesianGrid horizontal={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} /><XAxis type="number" domain={[...domain]} tickFormatter={(value) => formatDivergingBarValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} /><YAxis type="category" dataKey="label" interval={0} width={148} tick={(props: unknown) => <DivergingTick {...(props as { x?: number; y?: number; payload?: { value?: string } })} theme={theme} />} axisLine={false} tickLine={false} />
      <ReferenceLine x={0} stroke={theme.tertiary} strokeWidth={1.4} data-zero-reference="true" /><Tooltip cursor={{ fill: theme.grid, opacity: .2 }} content={({ active: a, payload }) => <DivergingTooltip active={a} payload={payload as unknown as readonly { payload?: DivergingBarGeometryDatum }[]} theme={theme} seriesName={seriesName} unit={unit} />} />
      <Bar dataKey="value" name={seriesName} maxBarSize={48} shape={(props: unknown) => <DivergingShape {...(props as Omit<ShapeProps, "theme" | "unit">)} theme={theme} unit={unit} />} {...motion} />
    </BarChart></ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", right: 8, bottom: 4, maxWidth: "84%", padding: theme.tooltip.padding, background: theme.surfaceAlt, color: theme.text }}>{active.label}: {seriesName} {active.value === null ? "missing" : withUnit(active.value, unit)}; {active.value === null ? "missing" : active.value > 0 ? "positive" : active.value < 0 ? "negative" : "unchanged"}{active.detail ? `; ${active.detail}` : ""}</div> : null}
    <AccessibleDataTable caption="Diverging bar values" rows={geometry} columns={[{ key: "label", label: "Category", value: (datum) => datum.label }, { key: "value", label: `${seriesName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.value ?? "Missing" }, { key: "direction", label: "Direction", value: (datum) => datum.value === null ? "Missing" : datum.value > 0 ? "Positive" : datum.value < 0 ? "Negative" : "Unchanged" }, { key: "detail", label: "Detail", value: (datum) => datum.detail ?? "" }]} />
  </div>;
}

export function DivergingBarChart({ data = divergingBarExample, visualSystem = "signal", animate, title = "Growth and decline split the map", subtitle = "SIGNED CHANGE · SHARED ZERO BASELINE", seriesName = "Change", unit = "" }: DivergingBarChartProps) { const theme = getVisualSystem(visualSystem); const shouldAnimate = resolveDivergingBarAnimation(animate, usePrefersReducedMotion()); const validation = validateDivergingBarData(data); const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid"; return <ChartShell code="C08" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · DIVERGING BARS`} theme={theme} state={state} description="Signed values extend from one shared zero baseline while missing values remain gaps."><DivergingBarGeometry data={validation.valid ? data : []} theme={theme} animate={shouldAnimate} seriesName={seriesName} unit={unit} /></ChartShell>; }

export { buildDivergingBarGeometry, getDivergingBarDomain, getDivergingBarLength, mapDivergingBarX, validateDivergingBarData } from "./schema";
export type { DivergingBarDatum, DivergingBarGeometryDatum } from "./schema";
export { divergingBarExample, divergingBarEdgeCases } from "./example-data";
export { divergingBarMetadata } from "./metadata";
