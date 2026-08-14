import { useState, type KeyboardEvent } from "react";
import { Bar, BarChart, CartesianGrid, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { stackedColumnExample } from "./example-data";
import { getStackedColumnMotion } from "./motion";
import { buildStackedColumnGeometry, getStackedColumnDomain, validateStackedColumnData, type StackedColumnDatum, type StackedColumnGeometryDatum, type StackedSeriesKey } from "./schema";

export type StackedColumnChartProps = {
  data?: readonly StackedColumnDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  baseName?: string;
  upperName?: string;
  unit?: string;
};

export const formatStackedColumnLabel = (label: string, maximum = 12) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatStackedColumnValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return Number(value.toFixed(2)).toString();
};
export const resolveStackedColumnAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;
const valueWithUnit = (value: number, unit: string) => `${formatStackedColumnValue(value)}${unit ? ` ${unit}` : ""}`;

type StackedShapeProps = {
  x?: number; y?: number; width?: number; height?: number;
  payload?: StackedColumnGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  series: StackedSeriesKey;
  unit: string;
};

function StackedShape({ x = 0, y = 0, width = 0, height = 0, payload, theme, series, unit }: StackedShapeProps) {
  const value = payload?.[series];
  if (!payload || value === null || value === undefined) return null;
  const rectY = Math.min(y, y + height);
  const rectHeight = Math.abs(height);
  const isBase = series === "value";
  const fill = isBase ? (theme.key === "signal" ? (payload.focus ? theme.primary : theme.secondary) : theme.primary) : (theme.key === "signal" ? theme.fourth : theme.secondary);
  const start = series === "value" ? payload.valueStart : payload.comparisonStart;
  const end = series === "value" ? payload.valueEnd : payload.comparisonEnd;
  const lightSegment = isBase && !(theme.key === "signal" && payload.focus);
  const segmentText = lightSegment ? theme.background : theme.text;
  const isPositiveExtent = value > 0 && payload.positiveLabelSeries === series;
  const isNegativeExtent = value < 0 && payload.negativeLabelSeries === series;
  const isZeroExtent = value === 0 && payload.complete && payload.positiveTotal === 0 && payload.negativeTotal === 0 && series === "comparison";
  const extentValue = isPositiveExtent ? payload.positiveTotal : isNegativeExtent ? payload.negativeTotal : 0;
  const extentLabel = payload.complete ? `Σ ${valueWithUnit(extentValue, unit)}` : `Visible ${valueWithUnit(extentValue, unit)}`;
  const extentY = isNegativeExtent ? rectY + rectHeight + 14 : rectY - 7;
  return <g data-stacked-bar={`${payload.label}:${series}`} data-series={series} data-category={payload.label} data-segment-start={start ?? "missing"} data-segment-end={end ?? "missing"}>
    <rect x={x} y={rectY} width={Math.max(0, width)} height={rectHeight} rx={theme.radius.mark} fill={fill} data-focus={isBase && payload.focus ? "true" : "false"}>
      {payload.animate ? <animate data-mav-entry="stacked-column" attributeName="opacity" from="0" to="1" dur="0.72s" fill="freeze" /> : null}
    </rect>
    {rectHeight >= 24 ? <text data-segment-label x={x + width / 2} y={rectY + rectHeight / 2 + theme.label.fontSize / 3} textAnchor="middle" fill={segmentText} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight} style={{ pointerEvents: "none" }}>{formatStackedColumnValue(value)}</text> : null}
    {isPositiveExtent || isNegativeExtent || isZeroExtent ? <text data-stack-total x={x + width / 2} y={isZeroExtent ? y - 7 : extentY} textAnchor="middle" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight} style={{ pointerEvents: "none" }}>{isZeroExtent ? `Σ ${valueWithUnit(0, unit)}` : extentLabel}</text> : null}
  </g>;
}

function StackedTooltip({ active, payload, theme, baseName, upperName, unit }: { active?: boolean; payload?: readonly { payload?: StackedColumnGeometryDatum }[]; theme: VisualSystemTokens; baseName: string; upperName: string; unit: string }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  const signed = datum.negativeTotal < 0 && datum.positiveTotal > 0;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{baseName}: {datum.value === null ? "Missing" : valueWithUnit(datum.value, unit)}</div><div>{upperName}: {datum.comparison === null ? "Missing" : valueWithUnit(datum.comparison, unit)}</div><div>{signed ? "Net" : "Total"}: {datum.total === null ? "Missing" : valueWithUnit(datum.total, unit)}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function StackedColumnGeometry({ data, theme, animate = true, baseName = "Core", upperName = "Expansion", unit = "" }: { data: readonly StackedColumnDatum[]; theme: VisualSystemTokens; animate?: boolean; baseName?: string; upperName?: string; unit?: string }) {
  const domain = getStackedColumnDomain(data);
  const geometry = buildStackedColumnGeometry(data).map((datum) => ({ ...datum, animate }));
  const hasNegative = geometry.some(({ negativeTotal }) => negativeTotal < 0);
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
  const upperColor = theme.key === "signal" ? theme.fourth : theme.secondary;
  return <div role="group" aria-label="Stacked columns interactive chart" data-animation-enabled={animate ? "true" : "false"} data-stacked-animation={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Stacked column legend" data-stacked-legend style={{ position: "absolute", zIndex: 2, top: 2, left: 8, display: "flex", flexWrap: "wrap", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      {theme.key === "signal" ? <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.primary }} />First {baseName} focus</span> : null}
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.key === "signal" ? theme.secondary : theme.primary }} />{baseName}{unit ? ` · ${unit}` : ""}</span>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: upperColor }} />{upperName}{unit ? ` · ${unit}` : ""}</span>
      <span role="listitem">Missing ≠ 0</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={geometry} margin={{ top: 52, right: 14, left: -4, bottom: 8 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis dataKey="label" interval={0} tickFormatter={(label) => formatStackedColumnLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} />
        <YAxis domain={[...domain]} tickFormatter={(value) => formatStackedColumnValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} width={44} />
        {hasNegative ? <ReferenceLine y={0} stroke={theme.tertiary} strokeWidth={1.4} /> : null}
        <Tooltip cursor={{ fill: theme.grid, opacity: 0.2 }} content={({ active: tooltipActive, payload }) => <StackedTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: StackedColumnGeometryDatum }[]} theme={theme} baseName={baseName} upperName={upperName} unit={unit} />} />
        <Bar dataKey="value" name={baseName} stackId="total" maxBarSize={104} shape={(props: unknown) => <StackedShape {...(props as Omit<StackedShapeProps, "theme" | "series" | "unit">)} theme={theme} series="value" unit={unit} />} {...getStackedColumnMotion(theme.key, animate, 0)} />
        <Bar dataKey="comparison" name={upperName} stackId="total" maxBarSize={104} shape={(props: unknown) => <StackedShape {...(props as Omit<StackedShapeProps, "theme" | "series" | "unit">)} theme={theme} series="comparison" unit={unit} />} {...getStackedColumnMotion(theme.key, animate, 1)} />
      </BarChart>
    </ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "84%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {baseName} {active.value === null ? "missing" : valueWithUnit(active.value, unit)}; {upperName} {active.comparison === null ? "missing" : valueWithUnit(active.comparison, unit)}; {active.negativeTotal < 0 && active.positiveTotal > 0 ? "net" : "total"} {active.total === null ? "missing" : valueWithUnit(active.total, unit)}{active.detail ? `; ${active.detail}` : ""}</div> : null}
    <AccessibleDataTable caption="Stacked column values" rows={geometry} columns={[{ key: "label", label: "Category", value: (datum) => datum.label }, { key: "base", label: `${baseName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.value ?? "Missing" }, { key: "upper", label: `${upperName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.comparison ?? "Missing" }, { key: "total", label: "Total / net", value: (datum) => datum.total ?? "Missing" }, { key: "detail", label: "Detail", value: (datum) => datum.detail ?? "" }]} />
  </div>;
}

export function StackedColumnChart({ data = stackedColumnExample, visualSystem = "signal", animate, title = "Every mix reached the same total", subtitle = "CORE + EXPANSION · SHARED SCALE", baseName = "Core", upperName = "Expansion", unit = "" }: StackedColumnChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveStackedColumnAnimation(animate, reducedMotion);
  const validation = validateStackedColumnData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  const safeData = validation.valid ? data : [];
  return <ChartShell code="C04" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · STACKED COLUMNS`} theme={theme} state={state} description="Two same-unit segments encode total and composition with separate positive and negative accumulation."><StackedColumnGeometry data={safeData} theme={theme} animate={shouldAnimate} baseName={baseName} upperName={upperName} unit={unit} /></ChartShell>;
}

export { buildStackedColumnGeometry, getStackedColumnDomain, validateStackedColumnData } from "./schema";
export type { StackedColumnDatum, StackedColumnGeometryDatum, StackedSeriesKey } from "./schema";
export { stackedColumnExample, stackedColumnEdgeCases } from "./example-data";
export { stackedColumnMetadata } from "./metadata";
