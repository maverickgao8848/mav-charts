import { useState, type KeyboardEvent } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { groupedBarExample } from "./example-data";
import { getGroupedBarMotion } from "./motion";
import { buildGroupedBarGeometry, getGroupedBarDomain, validateGroupedBarData, type GroupedBarDatum, type GroupedBarGeometryDatum } from "./schema";

export type GroupedBarChartProps = { data?: readonly GroupedBarDatum[]; visualSystem?: VisualSystemId; animate?: boolean; title?: string; subtitle?: string; primaryName?: string; comparisonName?: string; unit?: string };
export const formatGroupedBarLabel = (label: string, maximum = 20) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatGroupedBarValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return Number(value.toFixed(2)).toString();
};
export const resolveGroupedBarAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;
const valueWithUnit = (value: number, unit: string) => `${formatGroupedBarValue(value)}${unit ? ` ${unit}` : ""}`;

type ShapeProps = { x?: number; y?: number; width?: number; height?: number; payload?: GroupedBarGeometryDatum & { animate?: boolean }; theme: VisualSystemTokens; series: "value" | "comparison"; unit: string };
function GroupedShape({ x = 0, y = 0, width = 0, height = 0, payload, theme, series, unit }: ShapeProps) {
  const value = payload?.[series];
  if (!payload || value === null || value === undefined) return null;
  const rectX = Math.min(x, x + width);
  const rectWidth = Math.abs(width);
  const primary = series === "value";
  const fill = primary ? (theme.key === "signal" ? (payload.focus ? theme.primary : theme.secondary) : theme.primary) : (theme.key === "signal" ? theme.fourth : theme.secondary);
  const labelX = rectX + rectWidth + 6;
  return <g data-grouped-bar={`${payload.label}:${series}`} data-series={series} data-category-index={payload.index}>
    <rect x={rectX} y={y} width={rectWidth} height={Math.max(0, height)} rx={Math.min(theme.radius.mark, Math.abs(height) / 2)} fill={fill} data-focus={primary && payload.focus ? "true" : "false"}>
      {payload.animate ? <animate data-mav-entry="grouped-bar" attributeName="opacity" from="0" to="1" dur="0.72s" fill="freeze" /> : null}
    </rect>
    <text data-grouped-value x={labelX} y={y + height / 2 + theme.label.fontSize / 3} textAnchor="start" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight} style={{ pointerEvents: "none" }}>{valueWithUnit(value, unit)}</text>
  </g>;
}

function GroupedTick({ x = 0, y = 0, payload, theme }: { x?: number; y?: number; payload?: { value?: string }; theme: VisualSystemTokens }) {
  const label = String(payload?.value ?? "");
  return <text data-grouped-tick={label} x={x - 7} y={y + theme.label.fontSize / 3} textAnchor="end" fill={theme.muted} fontFamily={theme.body} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>{formatGroupedBarLabel(label)}</text>;
}

function PairTooltip({ active, payload, theme, primaryName, comparisonName, unit }: { active?: boolean; payload?: readonly { payload?: GroupedBarGeometryDatum }[]; theme: VisualSystemTokens; primaryName: string; comparisonName: string; unit: string }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{primaryName}: {datum.value === null ? "Missing" : valueWithUnit(datum.value, unit)}</div><div>{comparisonName}: {datum.comparison === null ? "Missing" : valueWithUnit(datum.comparison, unit)}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function GroupedBarGeometry({ data, theme, animate = true, primaryName = "Current", comparisonName = "Prior", unit = "" }: { data: readonly GroupedBarDatum[]; theme: VisualSystemTokens; animate?: boolean; primaryName?: string; comparisonName?: string; unit?: string }) {
  const domain = getGroupedBarDomain(data);
  const geometry = buildGroupedBarGeometry(data).map((datum) => ({ ...datum, animate }));
  const hasNegative = geometry.some((datum) => [datum.value, datum.comparison].some((value) => value !== null && value < 0));
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!geometry.length || !["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => event.key === "Home" ? 0 : event.key === "End" ? geometry.length - 1 : event.key === "ArrowDown" ? ((current ?? 0) + 1) % geometry.length : ((current ?? 0) - 1 + geometry.length) % geometry.length);
  };
  const comparisonColor = theme.key === "signal" ? theme.fourth : theme.secondary;
  return <div role="group" aria-label="Grouped bars interactive chart" data-animation-enabled={animate ? "true" : "false"} data-grouped-animation={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Grouped bar legend" data-grouped-legend style={{ position: "absolute", zIndex: 2, top: 2, left: 8, display: "flex", flexWrap: "wrap", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      {theme.key === "signal" ? <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.primary }} />Focus</span> : null}
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.key === "signal" ? theme.secondary : theme.primary }} />{primaryName}{unit ? ` · ${unit}` : ""}</span>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: comparisonColor }} />{comparisonName}{unit ? ` · ${unit}` : ""}</span>
      <span role="listitem">Missing = gap</span>
    </div>
    <ResponsiveContainer width="100%" height="100%"><BarChart data={geometry} layout="vertical" barGap="10%" barCategoryGap="27%" margin={{ top: 50, right: 72, left: 4, bottom: 8 }} accessibilityLayer>
      <CartesianGrid horizontal={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
      <XAxis type="number" domain={[...domain]} tickFormatter={(value) => formatGroupedBarValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} />
      <YAxis type="category" dataKey="label" interval={0} width={148} tick={(props: unknown) => <GroupedTick {...(props as { x?: number; y?: number; payload?: { value?: string } })} theme={theme} />} axisLine={false} tickLine={false} />
      {hasNegative ? <ReferenceLine x={0} stroke={theme.tertiary} strokeWidth={1.4} data-zero-reference="true" /> : null}
      <Tooltip cursor={{ fill: theme.grid, opacity: 0.2 }} content={({ active: tooltipActive, payload }) => <PairTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: GroupedBarGeometryDatum }[]} theme={theme} primaryName={primaryName} comparisonName={comparisonName} unit={unit} />} />
      <Bar dataKey="value" name={primaryName} maxBarSize={24} shape={(props: unknown) => <GroupedShape {...(props as Omit<ShapeProps, "theme" | "series" | "unit">)} theme={theme} series="value" unit={unit} />} {...getGroupedBarMotion(theme.key, animate, 0)} />
      <Bar dataKey="comparison" name={comparisonName} maxBarSize={24} shape={(props: unknown) => <GroupedShape {...(props as Omit<ShapeProps, "theme" | "series" | "unit">)} theme={theme} series="comparison" unit={unit} />} {...getGroupedBarMotion(theme.key, animate, 1)} />
    </BarChart></ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "82%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {primaryName} {active.value === null ? "missing" : valueWithUnit(active.value, unit)}; {comparisonName} {active.comparison === null ? "missing" : valueWithUnit(active.comparison, unit)}{active.detail ? `; ${active.detail}` : ""}</div> : null}
    <AccessibleDataTable caption="Grouped bar values" rows={geometry} columns={[{ key: "label", label: "Category", value: (datum) => datum.label }, { key: "primary", label: `${primaryName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.value ?? "Missing" }, { key: "comparison", label: `${comparisonName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.comparison ?? "Missing" }, { key: "detail", label: "Detail", value: (datum) => datum.detail ?? "" }]} />
  </div>;
}

export function GroupedBarChart({ data = groupedBarExample, visualSystem = "signal", animate, title = "The lead changes by market", subtitle = "CURRENT VS PRIOR · INPUT ORDER PRESERVED", primaryName = "Current", comparisonName = "Prior", unit = "" }: GroupedBarChartProps) {
  const theme = getVisualSystem(visualSystem);
  const shouldAnimate = resolveGroupedBarAnimation(animate, usePrefersReducedMotion());
  const validation = validateGroupedBarData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="C06" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · GROUPED BARS`} theme={theme} state={state} description="Two same-unit series compared in input order on one honest horizontal scale."><GroupedBarGeometry data={validation.valid ? data : []} theme={theme} animate={shouldAnimate} primaryName={primaryName} comparisonName={comparisonName} unit={unit} /></ChartShell>;
}

export { buildGroupedBarGeometry, getGroupedBarDomain, getGroupedBarLength, getGroupedBarSlots, mapGroupedBarX, validateGroupedBarData } from "./schema";
export type { GroupedBarDatum, GroupedBarGeometryDatum, GroupedBarSlots } from "./schema";
export { groupedBarExample, groupedBarEdgeCases } from "./example-data";
export { groupedBarMetadata } from "./metadata";
