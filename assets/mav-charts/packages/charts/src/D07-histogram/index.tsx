import { useState, type KeyboardEvent } from "react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { histogramExample } from "./example-data";
import { getHistogramMotion } from "./motion";
import { buildHistogramGeometry, getHistogramYDomain, validateHistogramBins, type HistogramBin, type HistogramGeometryBin } from "./schema";

export type HistogramChartProps = { data?: readonly HistogramBin[]; visualSystem?: VisualSystemId; animate?: boolean; title?: string; subtitle?: string };
export const resolveHistogramAnimation = (animate: boolean | undefined, reduced: boolean) => animate ?? !reduced;
export const formatHistogramLabel = (label: string, maximum = 13) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatHistogramCount = (value: number) => { const absolute = Math.abs(value); if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`; if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`; if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`; return String(value); };

type ShapeProps = { x?: number; y?: number; width?: number; height?: number; payload?: HistogramGeometryBin & { animate?: boolean }; theme: VisualSystemTokens };
function HistogramShape({ x = 0, y = 0, width = 0, height = 0, payload, theme }: ShapeProps) {
  if (!payload) return null;
  const color = payload.peak ? theme.primary : theme.key === "signal" ? theme.secondary : theme.secondary;
  if (payload.missing) return <g data-histogram-gap={payload.intervalLabel} data-bin-index={payload.index}><line x1={x + 2} x2={x + width - 2} y1={y - 2} y2={y - 2} stroke={theme.muted} strokeWidth={2} strokeDasharray="4 4" /><text x={x + width / 2} y={y - 9} textAnchor="middle" fill={theme.muted} fontSize={theme.label.fontSize}>MISSING</text></g>;
  if (payload.count === 0) return <g data-histogram-bar={payload.intervalLabel} data-bin-index={payload.index} data-count="0" data-peak={payload.peak ? "true" : "false"}><line data-zero-count x1={x + 1} x2={x + width - 1} y1={y - 1} y2={y - 1} stroke={color} strokeWidth={2} />{payload.peak ? <text data-histogram-direct-peak x={x + width / 2} y={y - 9} textAnchor="middle" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>PEAK 0</text> : null}</g>;
  return <g data-histogram-bar={payload.intervalLabel} data-bin-index={payload.index} data-count={payload.count ?? "missing"} data-peak={payload.peak ? "true" : "false"}>
    <rect data-histogram-rect x={x + 1} y={y} width={Math.max(0, width - 2)} height={Math.max(0, height)} fill={color} rx={theme.radius.mark}>
      {payload.animate ? <animate data-mav-entry="histogram" attributeName="opacity" from="0" to="1" dur="0.66s" fill="freeze" /> : null}
    </rect>
    {payload.peak ? <text data-histogram-direct-peak x={x + width / 2} y={y - 9} textAnchor="middle" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>PEAK {formatHistogramCount(payload.count!)}</text> : null}
  </g>;
}

function HistogramTooltip({ active, payload, theme }: { active?: boolean; payload?: readonly { payload?: HistogramGeometryBin }[]; theme: VisualSystemTokens }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div data-histogram-tooltip style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.intervalLabel}</strong><div>Interval: {datum.start} to {datum.end}</div><div>Count: {datum.count === null ? "Missing" : formatHistogramCount(datum.count)}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function HistogramGeometry({ data, theme, animate = true }: { data: readonly HistogramBin[]; theme: VisualSystemTokens; animate?: boolean }) {
  const geometry = buildHistogramGeometry(data).map((datum) => ({ ...datum, animate })), domain = getHistogramYDomain(data);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null), active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => { if (!geometry.length || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return; event.preventDefault(); setKeyboardIndex((current) => event.key === "Home" ? 0 : event.key === "End" ? geometry.length - 1 : event.key === "ArrowRight" ? ((current ?? 0) + 1) % geometry.length : ((current ?? 0) - 1 + geometry.length) % geometry.length); };
  return <div role="group" aria-label="Histogram interactive chart" data-histogram-animation={animate ? "true" : "false"} data-histogram-domain={`${domain[0]},${domain[1]}`} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={onKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none", display: "grid", gridTemplateRows: "auto minmax(0, 1fr)" }}>
    <div role="list" aria-label="Histogram legend" data-histogram-legend style={{ position: "relative", zIndex: 3, justifySelf: "end", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: theme.legend.gap, padding: "0 8px 4px", color: theme.muted, fontSize: theme.legend.fontSize }}><span role="listitem" style={{ color: theme.primary }}>■ First peak</span><span role="listitem" style={{ color: theme.secondary }}>■ Other bins</span><span role="listitem">Equal-width continuous bins · height = count</span><span role="listitem">┄ Missing bin</span></div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={geometry} margin={{ top: 24, right: 18, left: 0, bottom: 12 }} accessibilityLayer barCategoryGap="8%">
        <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis dataKey="intervalLabel" interval="preserveStartEnd" minTickGap={10} tickFormatter={(label) => formatHistogramLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} />
        <YAxis domain={[...domain]} allowDecimals={false} tickFormatter={(value) => formatHistogramCount(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} width={54} />
        <Tooltip cursor={{ fill: theme.grid, opacity: 0.18 }} content={({ active, payload }) => <HistogramTooltip active={active} payload={payload as unknown as readonly { payload?: HistogramGeometryBin }[]} theme={theme} />} />
        <Bar dataKey="plotValue" shape={(props: unknown) => <HistogramShape {...(props as Omit<ShapeProps, "theme">)} theme={theme} />} {...getHistogramMotion(theme.key, animate)} />
      </BarChart>
    </ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 5, right: 8, bottom: 4, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.intervalLabel}: interval {active.start} to {active.end}; count {active.count === null ? "Missing" : formatHistogramCount(active.count)}{active.peak ? "; first peak" : ""}</div> : null}
    <AccessibleDataTable caption="Pre-binned histogram values" rows={geometry} columns={[{ key: "interval", label: "Interval", value: (row) => row.intervalLabel }, { key: "start", label: "Start inclusive", value: (row) => row.start }, { key: "end", label: "End exclusive", value: (row) => row.end }, { key: "count", label: "Count", value: (row) => row.count ?? "Missing" }, { key: "peak", label: "Peak", value: (row) => row.peak ? "First peak" : "No" }]} />
  </div>;
}

export function HistogramChart({ data = histogramExample, visualSystem = "signal", animate, title = "The distribution peaks between 30 and 40", subtitle = "PRE-BINNED FREQUENCY · EQUAL-WIDTH CONTINUOUS INTERVALS" }: HistogramChartProps) {
  const theme = getVisualSystem(visualSystem), validation = validateHistogramBins(data), state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="D07" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · HISTOGRAM`} theme={theme} state={state} description="A pre-binned frequency distribution with continuous equal-width intervals and explicit missing gaps."><HistogramGeometry data={validation.valid ? data : []} theme={theme} animate={resolveHistogramAnimation(animate, usePrefersReducedMotion())} /></ChartShell>;
}
export { buildHistogramGeometry, getHistogramBarWidth, getHistogramYDomain, mapHistogramY, validateHistogramBins, formatHistogramBoundary } from "./schema";
export type { HistogramBin, HistogramGeometryBin } from "./schema";
export { histogramExample, histogramEdgeCases } from "./example-data";
export { histogramMetadata } from "./metadata";
