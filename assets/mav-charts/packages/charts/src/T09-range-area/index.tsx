import { useId, useState, type KeyboardEvent } from "react";
import { Area, AreaChart, CartesianGrid, LabelList, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { rangeAreaExample } from "./example-data";
import { getRangeAreaMotion } from "./motion";
import { buildRangeAreaGeometry, getRangeAreaDomain, validateRangeAreaData, type RangeAreaDatum, type RangeAreaGeometryDatum } from "./schema";

export type RangeAreaChartProps = {
  data?: readonly RangeAreaDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
};

export const formatRangeAreaLabel = (label: string, maximum = 10) => label.length > maximum ? `${label.slice(0, maximum - 1)}…` : label;
export const resolveRangeAreaAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;
export const formatRangeAreaValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return String(value);
};

function RangeAreaTooltip({ active, payload, theme }: { active?: boolean; payload?: readonly { payload?: RangeAreaGeometryDatum }[]; theme: VisualSystemTokens }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>Median {datum.median}</div><small style={{ color: theme.muted }}>Range {datum.low}–{datum.high}</small></div>;
}

export function RangeAreaGeometry({ data, theme, animate = true }: { data: readonly RangeAreaDatum[]; theme: VisualSystemTokens; animate?: boolean }) {
  const gradientId = `range-area-${useId().replace(/:/g, "")}`;
  const geometry = buildRangeAreaGeometry(data);
  const domain = getRangeAreaDomain(data);
  const motion = getRangeAreaMotion(theme.key, animate);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.length - 1;
      const start = current ?? 0;
      return event.key === "ArrowRight" ? (start + 1) % geometry.length : (start - 1 + geometry.length) % geometry.length;
    });
  };

  return <div role="group" aria-label="Range area interactive chart" data-animation-enabled={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Legend" style={{ position: "absolute", zIndex: 2, top: 2, right: 8, display: "flex", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.secondary, opacity: .28 }} />Interval</span>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: 2, background: theme.primary }} />Median</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={[...geometry]} margin={{ top: 34, right: 14, left: -8, bottom: 8 }} accessibilityLayer>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.secondary} stopOpacity="0.42" /><stop offset="100%" stopColor={theme.secondary} stopOpacity="0.08" /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis dataKey="label" tickFormatter={(label) => formatRangeAreaLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} interval={0} />
        <YAxis domain={[...domain]} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} />
        <Tooltip content={({ active: tooltipActive, payload }) => <RangeAreaTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: RangeAreaGeometryDatum }[]} theme={theme} />} />
        <Area type="monotone" dataKey="range" stroke={theme.secondary} fill={`url(#${gradientId})`} strokeWidth={theme.line.hairline} {...motion} />
        <Line type="monotone" dataKey="median" stroke={theme.primary} strokeWidth={theme.line.emphasis} dot={{ fill: theme.tertiary, r: 3, strokeWidth: 0 }} {...motion}>
          <LabelList dataKey="median" position="top" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight} formatter={(value) => formatRangeAreaValue(Number(value))} />
        </Line>
      </AreaChart>
    </ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, top: 24, right: 8, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: median {active.median}; range {active.low}–{active.high}</div> : null}
    <AccessibleDataTable caption="Median and interval values" rows={geometry} columns={[{ key: "label", label: "Period", value: (row) => row.label }, { key: "low", label: "Low", value: (row) => row.low }, { key: "median", label: "Median", value: (row) => row.median }, { key: "high", label: "High", value: (row) => row.high }]} />
  </div>;
}

export function RangeAreaChart({ data = rangeAreaExample, visualSystem = "editorial", animate, title = "The upside widened after April", subtitle = "MEDIAN + 80% CONFIDENCE RANGE" }: RangeAreaChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveRangeAreaAnimation(animate, reducedMotion);
  const validation = validateRangeAreaData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="T09" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · RANGE AREA`} theme={theme} state={state} description="Median line with a bounded uncertainty interval."><RangeAreaGeometry data={data} theme={theme} animate={shouldAnimate} /></ChartShell>;
}

export { buildRangeAreaGeometry, getRangeAreaDomain, validateRangeAreaData } from "./schema";
export type { RangeAreaDatum, RangeAreaGeometryDatum } from "./schema";
export { rangeAreaExample, rangeAreaEdgeCases } from "./example-data";
export { rangeAreaMetadata } from "./metadata";
