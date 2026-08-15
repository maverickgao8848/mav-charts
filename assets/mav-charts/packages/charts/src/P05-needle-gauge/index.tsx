import { useState, type KeyboardEvent } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { needleGaugeExample } from "./example-data";
import { getNeedleGaugeMotion } from "./motion";
import { buildNeedleGaugeGeometry, validateNeedleGaugeData, type GaugeBandGeometry, type NeedleGaugeDatum } from "./schema";

export type NeedleGaugeChartProps = { data?: NeedleGaugeDatum | null; visualSystem?: VisualSystemId; animate?: boolean; title?: string; subtitle?: string; unit?: string };
export const resolveNeedleGaugeAnimation = (animate: boolean | undefined, reduced: boolean) => animate ?? !reduced;
export const formatNeedleGaugeLabel = (label: string, maximum = 25) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatNeedleGaugeValue = (value: number) => { const absolute = Math.abs(value); if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`; if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`; if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`; return Number(value.toFixed(4)).toString(); };
const bandColors = (theme: VisualSystemTokens) => [theme.secondary, theme.tertiary, theme.grid, theme.muted] as const;

function GaugeBandTooltip({ band, theme, unit }: { band: GaugeBandGeometry; theme: VisualSystemTokens; unit: string }) {
  return <div role="tooltip" data-needle-gauge-tooltip style={{ position: "absolute", zIndex: 6, right: 8, bottom: 4, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{band.label}</strong><div>{formatNeedleGaugeValue(band.min)}{unit} to {formatNeedleGaugeValue(band.max)}{unit}</div><div>{Number((band.share * 100).toFixed(1))}% of declared range</div></div>;
}

function GaugeNeedle({ rotation, animate, theme }: { rotation: number; animate: boolean; theme: VisualSystemTokens }) {
  const motion = getNeedleGaugeMotion(theme.key, animate);
  return <svg data-needle-overlay viewBox="0 0 100 62" preserveAspectRatio="xMidYMid meet" aria-hidden="true" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", overflow: "visible", pointerEvents: "none" }}>
    <g data-gauge-needle data-needle-rotation={rotation} transform={`rotate(${rotation} 50 50)`}>
      {motion.enabled ? <animateTransform data-mav-entry="gauge-needle" attributeName="transform" type="rotate" from="-90 50 50" to={`${rotation} 50 50`} dur={`${motion.duration}ms`} fill="freeze" /> : null}
      <line x1="50" y1="50" x2="50" y2="11" stroke={theme.primary} strokeWidth="2.4" strokeLinecap="square" />
      <circle cx="50" cy="50" r="3.4" fill={theme.primary} stroke={theme.background} strokeWidth="1" />
    </g>
  </svg>;
}

export function NeedleGaugeGeometry({ data, theme, animate = true, unit = "" }: { data: NeedleGaugeDatum; theme: VisualSystemTokens; animate?: boolean; unit?: string }) {
  const geometry = buildNeedleGaugeGeometry(data), colors = bandColors(theme), [hoveredIndex, setHoveredIndex] = useState<number | null>(null), [keyboardActive, setKeyboardActive] = useState(false), hovered = hoveredIndex === null ? null : geometry.bands[hoveredIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => { if (!["Home", "End", "ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)) return; event.preventDefault(); setKeyboardActive(true); };
  const activeBand = geometry.bands.find(({ containsValue }) => containsValue)!;
  return <div role="group" aria-label="Needle gauge interactive chart" data-needle-animation={animate ? "true" : "false"} data-min={data.min} data-max={data.max} data-value={data.value ?? "missing"} data-needle-angle={geometry.needleAngle} tabIndex={0} onFocus={() => setKeyboardActive(true)} onBlur={() => setKeyboardActive(false)} onKeyDown={onKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none", display: "grid", gridTemplateRows: "auto minmax(0, 1fr)" }}>
    <div role="list" aria-label="Gauge range legend" data-gauge-legend style={{ justifySelf: "end", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: theme.legend.gap, padding: "0 8px 3px", color: theme.muted, fontSize: theme.legend.fontSize }}>
      {geometry.bands.map((band, index) => <span role="listitem" key={band.label} title={band.label} style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize, height: theme.legend.iconSize, background: colors[index % colors.length] }} />{formatNeedleGaugeLabel(band.label)} {formatNeedleGaugeValue(band.min)}–{formatNeedleGaugeValue(band.max)}{unit}</span>)}
      <span role="listitem" style={{ color: theme.primary }}>│ Current needle</span>
    </div>
    <div data-needle-gauge-plot style={{ position: "relative", minHeight: 0 }}>
      <ResponsiveContainer width="100%" height="100%"><PieChart accessibilityLayer>
        <Pie data={geometry.bands} dataKey="span" nameKey="label" cx="50%" cy="80%" innerRadius="48%" outerRadius="72%" startAngle={180} endAngle={0} paddingAngle={0} stroke={theme.background} strokeWidth={3} isAnimationActive={animate} animationDuration={getNeedleGaugeMotion(theme.key, animate).duration} onMouseEnter={(_, index) => setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
          {geometry.bands.map((band, index) => <Cell key={band.label} data-gauge-band={band.label} data-band-min={band.min} data-band-max={band.max} data-band-share={band.share} data-start-angle={band.startAngle} data-end-angle={band.endAngle} data-band-angle={band.startAngle - band.endAngle} data-current-band={band.containsValue ? "true" : "false"} fill={colors[index % colors.length]} />)}
        </Pie>
      </PieChart></ResponsiveContainer>
      <GaugeNeedle rotation={geometry.needleRotation} animate={animate} theme={theme} />
      <div data-gauge-direct-value aria-hidden="true" style={{ position: "absolute", left: "50%", bottom: "2%", transform: "translateX(-50%)", display: "grid", textAlign: "center", color: theme.text, pointerEvents: "none" }}><strong style={{ fontFamily: theme.display, fontSize: 30, lineHeight: 1 }}>{formatNeedleGaugeValue(data.value!)}{unit}</strong><span style={{ color: theme.muted, fontSize: theme.label.fontSize }}>{formatNeedleGaugeLabel(data.label)}</span><span style={{ color: theme.primary, fontSize: theme.label.fontSize, fontWeight: 900 }}>{activeBand.label.toUpperCase()}</span></div>
    </div>
    {hovered ? <GaugeBandTooltip band={hovered} theme={theme} unit={unit} /> : null}
    {keyboardActive && !hovered ? <div role="status" data-needle-keyboard-tooltip style={{ position: "absolute", zIndex: 6, right: 8, bottom: 4, maxWidth: "72%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{data.label}: {formatNeedleGaugeValue(data.value!)}{unit}; range {formatNeedleGaugeValue(data.min)} to {formatNeedleGaugeValue(data.max)}{unit}; current band {activeBand.label}; linear angle {Number(geometry.needleAngle.toFixed(2))} degrees</div> : null}
    <AccessibleDataTable caption="Needle gauge ranges" rows={geometry.bands} columns={[{ key: "band", label: "Band", value: (row) => row.label }, { key: "minimum", label: "Minimum", value: (row) => row.min }, { key: "maximum", label: "Maximum", value: (row) => row.max }, { key: "share", label: "Share of range", value: (row) => `${Number((row.share * 100).toFixed(2))}%` }, { key: "current", label: "Contains current value", value: (row) => row.containsValue ? "Yes" : "No" }]} />
  </div>;
}

export function NeedleGaugeChart({ data = needleGaugeExample, visualSystem = "signal", animate, title = "Capacity is near the top of its balanced range", subtitle = "DECLARED RANGE · LINEAR NEEDLE POSITION", unit = "%" }: NeedleGaugeChartProps) {
  const theme = getVisualSystem(visualSystem), validation = data === null ? null : validateNeedleGaugeData(data), state = data === null ? "empty" : validation?.valid ? "ready" : "invalid";
  return <ChartShell code="P05" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · NEEDLE GAUGE`} theme={theme} state={state} description="One finite value mapped linearly across an explicit range with ordered contextual bands.">{data !== null && validation?.valid ? <NeedleGaugeGeometry data={data} theme={theme} animate={resolveNeedleGaugeAnimation(animate, usePrefersReducedMotion())} unit={unit} /> : null}</ChartShell>;
}

export { buildNeedleGaugeGeometry, mapGaugeAngle, mapNeedleRotation, validateNeedleGaugeData } from "./schema";
export type { GaugeBandGeometry, GaugeThreshold, NeedleGaugeDatum, NeedleGaugeGeometry as NeedleGaugeGeometryData } from "./schema";
export { needleGaugeExample, needleGaugeEdgeCases } from "./example-data";
export { needleGaugeMetadata } from "./metadata";
