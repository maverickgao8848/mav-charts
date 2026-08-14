import { useState, type KeyboardEvent } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { simpleColumnExample } from "./example-data";
import { getSimpleColumnMotion } from "./motion";
import { buildSimpleColumnGeometry, getSimpleColumnDomain, validateSimpleColumnData, type SimpleColumnDatum, type SimpleColumnGeometryDatum } from "./schema";

export type SimpleColumnChartProps = {
  data?: readonly SimpleColumnDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  seriesName?: string;
  unit?: string;
};

export const formatSimpleColumnLabel = (label: string, maximum = 11) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatSimpleColumnValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return Number(value.toFixed(2)).toString();
};
export const resolveSimpleColumnAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;

const valueWithUnit = (value: number, unit: string) => `${formatSimpleColumnValue(value)}${unit ? ` ${unit}` : ""}`;

type ColumnShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: SimpleColumnGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  unit: string;
};

function ColumnShape({ x = 0, y = 0, width = 0, height = 0, payload, theme, unit }: ColumnShapeProps) {
  if (!payload || payload.value === null) return null;
  // Recharts can interpolate negative bars with a negative height during entry.
  // SVG rects require a non-negative height, so normalize the transient geometry.
  const rectY = Math.min(y, y + height);
  const rectHeight = Math.abs(height);
  const labelY = payload.value >= 0 ? rectY - 7 : rectY + rectHeight + 14;
  const isSignalFocus = theme.key === "signal" && payload.index === 0;
  const fill = theme.key === "signal" ? (isSignalFocus ? theme.primary : theme.secondary) : theme.primary;
  return <g data-column-bar={payload.label}>
    <rect data-column-focus={isSignalFocus ? "true" : "false"} x={x} y={rectY} width={width} height={rectHeight} rx={theme.radius.mark} fill={fill}>
      {payload.animate ? <animate data-mav-entry="simple-column" attributeName="opacity" from="0" to="1" dur="0.7s" fill="freeze" /> : null}
    </rect>
    <text x={x + width / 2} y={labelY} textAnchor="middle" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>{valueWithUnit(payload.value, unit)}</text>
  </g>;
}

function SimpleColumnTooltip({ active, payload, theme, seriesName, unit }: { active?: boolean; payload?: readonly { payload?: SimpleColumnGeometryDatum }[]; theme: VisualSystemTokens; seriesName: string; unit: string }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{seriesName}: {datum.value === null ? "Missing" : valueWithUnit(datum.value, unit)}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function SimpleColumnGeometry({ data, theme, animate = true, seriesName = "Value", unit = "" }: { data: readonly SimpleColumnDatum[]; theme: VisualSystemTokens; animate?: boolean; seriesName?: string; unit?: string }) {
  const domain = getSimpleColumnDomain(data);
  const motion = getSimpleColumnMotion(theme.key, animate);
  const geometry = buildSimpleColumnGeometry(data).map((datum) => ({ ...datum, animate }));
  const hasNegative = geometry.some(({ value }) => value !== null && value < 0);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (geometry.length === 0 || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.length - 1;
      const start = current ?? 0;
      return event.key === "ArrowRight" ? (start + 1) % geometry.length : (start - 1 + geometry.length) % geometry.length;
    });
  };

  return <div role="group" aria-label="Simple columns interactive chart" data-animation-enabled={animate ? "true" : "false"} data-column-animation={motion.isAnimationActive ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Column legend" style={{ position: "absolute", zIndex: 2, top: 2, left: 8, display: "flex", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      {theme.key === "signal" ? <>
        <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.primary, borderRadius: theme.radius.mark }} />Focus</span>
        <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.secondary, borderRadius: theme.radius.mark }} />{seriesName}{unit ? ` · ${unit}` : ""}</span>
      </> : <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.primary, borderRadius: theme.radius.mark }} />{seriesName}{unit ? ` · ${unit}` : ""}</span>}
      <span role="listitem">Missing = gap</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={geometry} margin={{ top: 42, right: 14, left: -4, bottom: 8 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis dataKey="label" interval={0} tickFormatter={(label) => formatSimpleColumnLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} />
        <YAxis domain={[...domain]} tickFormatter={(value) => formatSimpleColumnValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} width={44} />
        {hasNegative ? <ReferenceLine y={0} stroke={theme.secondary} strokeWidth={1.4} /> : null}
        <Tooltip cursor={{ fill: theme.grid, opacity: 0.2 }} content={({ active: tooltipActive, payload }) => <SimpleColumnTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: SimpleColumnGeometryDatum }[]} theme={theme} seriesName={seriesName} unit={unit} />} />
        <Bar dataKey="value" name={`${seriesName}${unit ? ` (${unit})` : ""}`} maxBarSize={82} shape={(props: unknown) => <ColumnShape {...(props as Omit<ColumnShapeProps, "theme" | "unit">)} theme={theme} unit={unit} />} {...motion} />
      </BarChart>
    </ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "78%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {seriesName} {active.value === null ? "missing" : valueWithUnit(active.value, unit)}{active.detail ? `; ${active.detail}` : ""}</div> : null}
    <AccessibleDataTable caption="Simple column values" rows={geometry} columns={[{ key: "label", label: "Category", value: (datum) => datum.label }, { key: "value", label: `${seriesName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.value ?? "Missing" }, { key: "detail", label: "Detail", value: (datum) => datum.detail ?? "" }]} />
  </div>;
}

export function SimpleColumnChart({ data = simpleColumnExample, visualSystem = "signal", animate, title = "North remains the largest region", subtitle = "REGIONAL PERFORMANCE · CURRENT PERIOD", seriesName = "Value", unit = "" }: SimpleColumnChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveSimpleColumnAnimation(animate, reducedMotion);
  const validation = validateSimpleColumnData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="C01" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · SIMPLE COLUMNS`} theme={theme} state={state} description="Categorical values on an unbroken vertical bar scale with explicit missing gaps."><SimpleColumnGeometry data={data} theme={theme} animate={shouldAnimate} seriesName={seriesName} unit={unit} /></ChartShell>;
}

export { buildSimpleColumnGeometry, getSimpleColumnDomain, validateSimpleColumnData } from "./schema";
export type { SimpleColumnDatum, SimpleColumnGeometryDatum } from "./schema";
export { simpleColumnExample, simpleColumnEdgeCases } from "./example-data";
export { simpleColumnMetadata } from "./metadata";
