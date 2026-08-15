import { useState, type KeyboardEvent } from "react";
import { Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { dualAxisExample } from "./example-data";
import { getDualAxisMotion } from "./motion";
import { buildDualAxisGeometry, getDualAxisDomains, validateDualAxisData, type DualAxisDatum, type DualAxisGeometryDatum } from "./schema";

export type DualAxisChartProps = {
  data?: readonly DualAxisDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  barName?: string;
  barUnit?: string;
  lineName?: string;
  lineUnit?: string;
};

export const formatDualAxisLabel = (label: string, maximum = 10) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatDualAxisValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return Number(value.toFixed(2)).toString();
};
export const resolveDualAxisAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;

function DualAxisTooltip({ active, payload, theme, barName, barUnit, lineName, lineUnit }: { active?: boolean; payload?: readonly { payload?: DualAxisGeometryDatum }[]; theme: VisualSystemTokens; barName: string; barUnit: string; lineName: string; lineUnit: string }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{barName}: {datum.barValue === null ? "Missing" : `${datum.barValue} ${barUnit}`}</div><div>{lineName}: {datum.lineValue === null ? "Missing" : `${datum.lineValue} ${lineUnit}`}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function DualAxisGeometry({ data, theme, animate = true, barName = "Revenue", barUnit = "$M", lineName = "Margin", lineUnit = "%" }: { data: readonly DualAxisDatum[]; theme: VisualSystemTokens; animate?: boolean; barName?: string; barUnit?: string; lineName?: string; lineUnit?: string }) {
  const geometry = buildDualAxisGeometry(data);
  const domains = getDualAxisDomains(data);
  const motion = getDualAxisMotion(theme.key, animate);
  const lineColor = theme.key === "editorial" ? theme.tertiary : theme.secondary;
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const peakBar = geometry.filter((datum) => datum.barValue !== null).reduce<DualAxisGeometryDatum | null>((current, datum) => !current || (datum.barValue as number) > (current.barValue as number) ? datum : current, null);
  const latestLine = [...geometry].reverse().find((datum) => datum.lineValue !== null);
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

  return <div role="group" aria-label="Dual axis interactive chart" data-animation-enabled={animate ? "true" : "false"} data-bar-animation={motion.bar.isAnimationActive ? "true" : "false"} data-line-animation={motion.line.isAnimationActive ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div data-dual-axis-overlay style={{ position: "absolute", zIndex: 2, top: 1, left: 8, right: 8, display: "grid", gap: 4 }}>
      <div role="list" aria-label="Series legend with independent units" style={{ display: "flex", flexWrap: "wrap", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
        <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.primary }} />{barName} · LEFT · {barUnit}</span>
        <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 5, height: 2, background: lineColor }} />{lineName} · RIGHT · {lineUnit}</span>
        <span role="listitem">INDEPENDENT SCALES</span>
      </div>
      <div aria-label="Direct series values" style={{ display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: "2px 10px", color: theme.text, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }}>
        {peakBar ? <span>PEAK {barName.toUpperCase()} · {formatDualAxisValue(peakBar.barValue as number)} {barUnit}</span> : null}
        {latestLine ? <span>LATEST {lineName.toUpperCase()} · {formatDualAxisValue(latestLine.lineValue as number)} {lineUnit}</span> : null}
      </div>
    </div>
    <div className="dual-axis-plot" style={{ position: "relative", width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={[...geometry]} margin={{ top: 48, right: 18, left: -4, bottom: 8 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis dataKey="label" interval={0} tickFormatter={(label) => formatDualAxisLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} />
        <YAxis yAxisId="bar" domain={[...domains.bar]} tickFormatter={(value) => formatDualAxisValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} width={42} />
        <YAxis yAxisId="line" orientation="right" domain={[...domains.line]} tickFormatter={(value) => formatDualAxisValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} width={42} />
        <ReferenceLine yAxisId="bar" y={0} stroke={theme.muted} strokeWidth={1.2} />
        <Tooltip content={({ active: tooltipActive, payload }) => <DualAxisTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: DualAxisGeometryDatum }[]} theme={theme} barName={barName} barUnit={barUnit} lineName={lineName} lineUnit={lineUnit} />} />
        <Bar yAxisId="bar" dataKey="barValue" name={`${barName} (${barUnit})`} fill={theme.primary} radius={theme.key === "editorial" ? [0, 0, 0, 0] : [3, 3, 0, 0]} maxBarSize={42} {...motion.bar} />
        <Line yAxisId="line" type="monotone" dataKey="lineValue" name={`${lineName} (${lineUnit})`} connectNulls={false} stroke={lineColor} strokeWidth={theme.line.emphasis} dot={{ fill: lineColor, r: 4, strokeWidth: 0 }} activeDot={{ fill: theme.text, r: 5, strokeWidth: 0 }} {...motion.line} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "78%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {barName} {active.barValue === null ? "missing" : `${active.barValue} ${barUnit}`}; {lineName} {active.lineValue === null ? "missing" : `${active.lineValue} ${lineUnit}`}</div> : null}
    <AccessibleDataTable caption="Independent dual-axis series" rows={geometry} columns={[{ key: "label", label: "Period", value: (datum) => datum.label }, { key: "bar", label: `${barName} (${barUnit}, left axis)`, value: (datum) => datum.barValue ?? "Missing" }, { key: "line", label: `${lineName} (${lineUnit}, right axis)`, value: (datum) => datum.lineValue ?? "Missing" }, { key: "detail", label: "Detail", value: (datum) => datum.detail ?? "" }]} />
  </div>;
}

export function DualAxisChart({ data = dualAxisExample, visualSystem = "signal", animate, title = "Growth held while margin reset", subtitle = "REVENUE $M · MARGIN % · H1", barName = "Revenue", barUnit = "$M", lineName = "Margin", lineUnit = "%" }: DualAxisChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveDualAxisAnimation(animate, reducedMotion);
  const validation = validateDualAxisData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="B03" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · DUAL AXIS`} theme={theme} state={state} description="Bar and line series on explicitly independent left and right scales."><DualAxisGeometry data={data} theme={theme} animate={shouldAnimate} barName={barName} barUnit={barUnit} lineName={lineName} lineUnit={lineUnit} /></ChartShell>;
}

export { buildDualAxisGeometry, getDualAxisDomains, validateDualAxisData } from "./schema";
export type { DualAxisDatum, DualAxisDomains, DualAxisGeometryDatum } from "./schema";
export { dualAxisExample, dualAxisEdgeCases } from "./example-data";
export { dualAxisMetadata } from "./metadata";
