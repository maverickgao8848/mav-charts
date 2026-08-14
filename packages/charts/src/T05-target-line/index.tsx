import { useState, type KeyboardEvent } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { targetLineExample } from "./example-data";
import { getTargetLineMotion } from "./motion";
import { buildTargetLineGeometry, buildTargetLineSegments, getTargetLineDomain, validateTargetLineData, type TargetLineDatum, type TargetLineGeometryDatum } from "./schema";

export type TargetLineChartProps = { data?: readonly TargetLineDatum[]; visualSystem?: VisualSystemId; animate?: boolean; title?: string; subtitle?: string; actualName?: string; targetName?: string; unit?: string };
export const formatTargetLineLabel = (label: string, maximum = 12) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatTargetLineValue = (value: number) => { const absolute = Math.abs(value); if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`; if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`; if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`; return Number(value.toFixed(3)).toString(); };
export const resolveTargetLineAnimation = (animate: boolean | undefined, reduced: boolean) => animate ?? !reduced;

type ActualDotProps = { cx?: number; cy?: number; payload?: TargetLineGeometryDatum & { animate?: boolean }; theme: VisualSystemTokens; unit: string };
function ActualDot({ cx = 0, cy = 0, payload, theme, unit }: ActualDotProps) {
  if (!payload || payload.actual === null) return null;
  return <g><circle data-target-actual-dot={payload.label} cx={cx} cy={cy} r={4} fill={theme.primary} stroke={theme.background} strokeWidth={1.5}>{payload.animate ? <animate data-mav-entry="target-line" attributeName="r" from="0" to="4" dur="0.7s" fill="freeze" /> : null}</circle>{payload.latestActual ? <text data-target-latest-actual x={cx - 7} y={cy - 13} textAnchor="end" fill={theme.primary} fontSize={theme.label.fontSize} fontWeight={800}>ACTUAL {formatTargetLineValue(payload.actual)}{unit}</text> : null}</g>;
}
type TargetDotProps = { cx?: number; cy?: number; payload?: TargetLineGeometryDatum; theme: VisualSystemTokens; unit: string };
function TargetDot({ cx = 0, cy = 0, payload, theme, unit }: TargetDotProps) {
  if (!payload || !payload.latestTarget) return null;
  return <g><circle data-target-marker cx={cx} cy={cy} r={3} fill={theme.text} /><text data-target-latest x={cx - 7} y={cy + 17} textAnchor="end" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={800}>TARGET {formatTargetLineValue(payload.target)}{unit}</text></g>;
}
function TargetTooltip({ active, payload, theme, actualName, targetName, unit }: { active?: boolean; payload?: readonly { payload?: TargetLineGeometryDatum }[]; theme: VisualSystemTokens; actualName: string; targetName: string; unit: string }) {
  const datum = payload?.[0]?.payload; if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{actualName}: {datum.actual === null ? "Missing" : `${formatTargetLineValue(datum.actual)}${unit}`}</div><div>{targetName}: {formatTargetLineValue(datum.target)}{unit}</div><div>Delta: {datum.delta === null ? "Missing" : `${datum.delta > 0 ? "+" : ""}${formatTargetLineValue(datum.delta)}${unit}`} · {datum.status}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function TargetLineGeometry({ data, theme, animate = true, actualName = "Actual", targetName = "Target", unit = "" }: { data: readonly TargetLineDatum[]; theme: VisualSystemTokens; animate?: boolean; actualName?: string; targetName?: string; unit?: string }) {
  const geometry = buildTargetLineGeometry(data).map((datum) => ({ ...datum, animate })); const domain = getTargetLineDomain(data); const [activeIndex, setActiveIndex] = useState<number | null>(null); const active = activeIndex === null ? null : geometry[activeIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => { if (!geometry.length || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return; event.preventDefault(); setActiveIndex((current) => { if (event.key === "Home") return 0; if (event.key === "End") return geometry.length - 1; const start = current ?? 0; return event.key === "ArrowRight" ? (start + 1) % geometry.length : (start - 1 + geometry.length) % geometry.length; }); };
  return <div role="group" aria-label="Target line interactive chart" data-target-animation={animate ? "true" : "false"} data-target-segments={buildTargetLineSegments(data).length} data-domain-min={domain[0]} data-domain-max={domain[1]} tabIndex={0} onFocus={() => setActiveIndex((current) => current ?? 0)} onBlur={() => setActiveIndex(null)} onKeyDown={onKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Target line legend" data-target-legend style={{ position: "absolute", zIndex: 2, top: 8, right: 8, display: "flex", flexWrap: "wrap", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 7, height: 3, background: theme.primary }} />{actualName}</span>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 7, borderTop: `2px dashed ${theme.text}` }} />{targetName}</span><span role="listitem">Missing = actual break</span>
    </div>
    <ResponsiveContainer width="100%" height="100%"><LineChart data={geometry} margin={{ top: 58, right: 48, left: 0, bottom: 10 }} accessibilityLayer>
      <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
      <XAxis dataKey="label" interval={0} tickFormatter={(label) => formatTargetLineLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} />
      <YAxis domain={[...domain]} tickFormatter={(value) => formatTargetLineValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} width={54} />
      <Tooltip cursor={{ stroke: theme.grid, strokeWidth: 1 }} content={({ active: tooltipActive, payload }) => <TargetTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: TargetLineGeometryDatum }[]} theme={theme} actualName={actualName} targetName={targetName} unit={unit} />} />
      <Line name={targetName} type="linear" dataKey="target" stroke={theme.text} strokeOpacity={.72} strokeWidth={2.5} strokeDasharray="8 7" dot={(props: unknown) => <TargetDot {...(props as Omit<TargetDotProps, "theme" | "unit">)} theme={theme} unit={unit} />} activeDot={false} {...getTargetLineMotion(theme.key, animate)} />
      <Line name={actualName} type="linear" dataKey="actual" connectNulls={false} stroke={theme.primary} strokeWidth={theme.line.emphasis} strokeLinecap="round" strokeLinejoin="round" dot={(props: unknown) => <ActualDot {...(props as Omit<ActualDotProps, "theme" | "unit">)} theme={theme} unit={unit} />} activeDot={{ r: 6, fill: theme.primary, stroke: theme.background }} {...getTargetLineMotion(theme.key, animate)} />
    </LineChart></ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {active.actual === null ? "Actual missing; line breaks" : `${actualName} ${formatTargetLineValue(active.actual)}${unit}; ${targetName} ${formatTargetLineValue(active.target)}${unit}; delta ${active.delta! > 0 ? "+" : ""}${formatTargetLineValue(active.delta!)}${unit}; ${active.status}`}</div> : null}
    <AccessibleDataTable caption="Actual versus target values" rows={geometry} columns={[{ key: "label", label: "Observation", value: (row) => row.label }, { key: "actual", label: actualName, value: (row) => row.actual ?? "Missing" }, { key: "target", label: targetName, value: (row) => row.target }, { key: "delta", label: "Delta", value: (row) => row.delta ?? "Missing" }, { key: "status", label: "Status", value: (row) => row.status }, { key: "detail", label: "Detail", value: (row) => row.detail ?? "" }]} />
  </div>;
}

export function TargetLineChart({ data = targetLineExample, visualSystem = "signal", animate, title = "Performance cleared the target in Q3", subtitle = "ACTUAL · TARGET · DELTA", actualName = "Actual", targetName = "Target", unit = "" }: TargetLineChartProps) {
  const theme = getVisualSystem(visualSystem); const validation = validateTargetLineData(data); const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="T05" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · TARGET LINE`} theme={theme} state={state} description="Actual and target share one unit and one honest padded domain; missing actual observations break only the actual path."><TargetLineGeometry data={validation.valid ? data : []} theme={theme} animate={resolveTargetLineAnimation(animate, usePrefersReducedMotion())} actualName={actualName} targetName={targetName} unit={unit} /></ChartShell>;
}

export { buildTargetLineGeometry, buildTargetLineSegments, getTargetLineDomain, mapTargetLineX, mapTargetLineY, validateTargetLineData } from "./schema";
export type { TargetLineDatum, TargetLineGeometryDatum, TargetLineSegment, TargetLineStatus } from "./schema";
export { targetLineExample, targetLineEdgeCases } from "./example-data";
export { targetLineMetadata } from "./metadata";
