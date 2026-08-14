import { useState, type KeyboardEvent } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { groupedColumnExample } from "./example-data";
import { getGroupedColumnMotion } from "./motion";
import { buildGroupedColumnGeometry, getGroupedColumnDomain, getGroupedColumnSlots, validateGroupedColumnData, type GroupedColumnDatum, type GroupedColumnGeometryDatum } from "./schema";

export type GroupedColumnChartProps = {
  data?: readonly GroupedColumnDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  primaryName?: string;
  comparisonName?: string;
  unit?: string;
};

export const formatGroupedColumnLabel = (label: string, maximum = 12) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatGroupedColumnValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return Number(value.toFixed(2)).toString();
};
export const resolveGroupedColumnAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;
const valueWithUnit = (value: number, unit: string) => `${formatGroupedColumnValue(value)}${unit ? ` ${unit}` : ""}`;

type GroupedShapeProps = {
  x?: number; y?: number; width?: number; height?: number;
  payload?: GroupedColumnGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens; series: "value" | "comparison"; unit: string;
};

function GroupedShape({ x = 0, y = 0, width = 0, height = 0, payload, theme, series, unit }: GroupedShapeProps) {
  const value = payload?.[series];
  if (!payload || value === null || value === undefined) return null;
  const rectY = Math.min(y, y + height);
  const rectHeight = Math.abs(height);
  const isPrimary = series === "value";
  const fill = isPrimary ? (theme.key === "signal" ? (payload.focus ? theme.primary : theme.secondary) : theme.primary) : (theme.key === "signal" ? theme.fourth : theme.secondary);
  const labelY = value >= 0 ? rectY - 6 : rectY + rectHeight + 13;
  return <g data-grouped-bar={`${payload.label}:${series}`} data-series={series}>
    <rect x={x} y={rectY} width={width} height={rectHeight} rx={theme.radius.mark} fill={fill} data-focus={isPrimary && payload.focus ? "true" : "false"}>
      {payload.animate ? <animate data-mav-entry="grouped-column" attributeName="opacity" from="0" to="1" dur="0.72s" fill="freeze" /> : null}
    </rect>
    <text x={x + width / 2} y={labelY} textAnchor="middle" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>{valueWithUnit(value, unit)}</text>
  </g>;
}

function GroupedTooltip({ active, payload, theme, primaryName, comparisonName, unit }: { active?: boolean; payload?: readonly { payload?: GroupedColumnGeometryDatum }[]; theme: VisualSystemTokens; primaryName: string; comparisonName: string; unit: string }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{primaryName}: {datum.value === null ? "Missing" : valueWithUnit(datum.value, unit)}</div><div>{comparisonName}: {datum.comparison === null ? "Missing" : valueWithUnit(datum.comparison, unit)}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function GroupedColumnGeometry({ data, theme, animate = true, primaryName = "Current", comparisonName = "Prior", unit = "" }: { data: readonly GroupedColumnDatum[]; theme: VisualSystemTokens; animate?: boolean; primaryName?: string; comparisonName?: string; unit?: string }) {
  const domain = getGroupedColumnDomain(data);
  const geometry = buildGroupedColumnGeometry(data).map((datum) => ({ ...datum, animate }));
  const hasNegative = geometry.some((datum) => [datum.value, datum.comparison].some((value) => value !== null && value < 0));
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!geometry.length || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.length - 1;
      const start = current ?? 0;
      return event.key === "ArrowRight" ? (start + 1) % geometry.length : (start - 1 + geometry.length) % geometry.length;
    });
  };
  const primaryColor = theme.primary;
  const comparisonColor = theme.key === "signal" ? theme.fourth : theme.secondary;
  return <div role="group" aria-label="Grouped columns interactive chart" data-animation-enabled={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Grouped column legend" data-grouped-legend style={{ position: "absolute", zIndex: 2, top: 2, left: 8, display: "flex", flexWrap: "wrap", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      {theme.key === "signal" ? <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: primaryColor }} />Focus</span> : null}
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.key === "signal" ? theme.secondary : primaryColor }} />{primaryName}{unit ? ` · ${unit}` : ""}</span>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: comparisonColor }} />{comparisonName}{unit ? ` · ${unit}` : ""}</span>
      <span role="listitem">Missing = gap</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={geometry} barGap="8%" barCategoryGap="24%" margin={{ top: 46, right: 14, left: -4, bottom: 8 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis dataKey="label" interval={0} tickFormatter={(label) => formatGroupedColumnLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} />
        <YAxis domain={[...domain]} tickFormatter={(value) => formatGroupedColumnValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} width={44} />
        {hasNegative ? <ReferenceLine y={0} stroke={theme.tertiary} strokeWidth={1.4} /> : null}
        <Tooltip cursor={{ fill: theme.grid, opacity: 0.2 }} content={({ active: tooltipActive, payload }) => <GroupedTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: GroupedColumnGeometryDatum }[]} theme={theme} primaryName={primaryName} comparisonName={comparisonName} unit={unit} />} />
        <Bar dataKey="value" name={primaryName} maxBarSize={58} shape={(props: unknown) => <GroupedShape {...(props as Omit<GroupedShapeProps, "theme" | "series" | "unit">)} theme={theme} series="value" unit={unit} />} {...getGroupedColumnMotion(theme.key, animate, 0)} />
        <Bar dataKey="comparison" name={comparisonName} maxBarSize={58} shape={(props: unknown) => <GroupedShape {...(props as Omit<GroupedShapeProps, "theme" | "series" | "unit">)} theme={theme} series="comparison" unit={unit} />} {...getGroupedColumnMotion(theme.key, animate, 1)} />
      </BarChart>
    </ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "82%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {primaryName} {active.value === null ? "missing" : valueWithUnit(active.value, unit)}; {comparisonName} {active.comparison === null ? "missing" : valueWithUnit(active.comparison, unit)}{active.detail ? `; ${active.detail}` : ""}</div> : null}
    <AccessibleDataTable caption="Grouped column values" rows={geometry} columns={[{ key: "label", label: "Category", value: (datum) => datum.label }, { key: "primary", label: `${primaryName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.value ?? "Missing" }, { key: "comparison", label: `${comparisonName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.comparison ?? "Missing" }, { key: "detail", label: "Detail", value: (datum) => datum.detail ?? "" }]} />
  </div>;
}

export function GroupedColumnChart({ data = groupedColumnExample, visualSystem = "signal", animate, title = "Momentum widened the lead", subtitle = "CURRENT VS PRIOR · SAME SCALE", primaryName = "Current", comparisonName = "Prior", unit = "" }: GroupedColumnChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveGroupedColumnAnimation(animate, reducedMotion);
  const validation = validateGroupedColumnData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="C03" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · GROUPED COLUMNS`} theme={theme} state={state} description="Two same-unit series compared side by side on one honest vertical scale."><GroupedColumnGeometry data={data} theme={theme} animate={shouldAnimate} primaryName={primaryName} comparisonName={comparisonName} unit={unit} /></ChartShell>;
}

export { buildGroupedColumnGeometry, getGroupedColumnDomain, getGroupedColumnSlots, validateGroupedColumnData } from "./schema";
export type { GroupedColumnDatum, GroupedColumnGeometryDatum, GroupedColumnSlots } from "./schema";
export { groupedColumnExample, groupedColumnEdgeCases } from "./example-data";
export { groupedColumnMetadata } from "./metadata";
