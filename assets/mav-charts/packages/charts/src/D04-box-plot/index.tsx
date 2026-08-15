import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { boxPlotExample } from "./example-data";
import { getBoxPlotMotion } from "./motion";
import { buildBoxPlotGeometry, getBoxPlotDomain, getBoxPlotWidth, getBoxPlotX, mapBoxPlotY, validateBoxPlotData, type BoxPlotDatum, type BoxPlotGeometryDatum } from "./schema";

export type BoxPlotChartProps = { data?: readonly BoxPlotDatum[]; visualSystem?: VisualSystemId; animate?: boolean; title?: string; subtitle?: string; unit?: string };
export const resolveBoxPlotAnimation = (animate: boolean | undefined, reduced: boolean) => animate ?? !reduced;
export const formatBoxPlotLabel = (label: string, maximum = 13) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatBoxPlotValue = (value: number) => { const absolute = Math.abs(value); if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`; if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`; if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`; return Number(value.toFixed(4)).toString(); };

type PlotView = { width: number; height: number; left: number; right: number; top: number; bottom: number };
function markColor(datum: BoxPlotGeometryDatum, theme: VisualSystemTokens) { return datum.focus ? theme.primary : theme.key === "signal" ? theme.secondary : theme.secondary; }

function BoxMark({ datum, count, domain, theme, animate, unit, view, onEnter, onLeave }: { datum: BoxPlotGeometryDatum; count: number; domain: readonly [number, number]; theme: VisualSystemTokens; animate: boolean; unit: string; view: PlotView; onEnter: () => void; onLeave: () => void }) {
  const x = getBoxPlotX(datum.index, count, [view.left, view.right]), width = getBoxPlotWidth(count, view.right - view.left);
  if (datum.missing) return <text data-box-missing={datum.label} x={x} y={(view.top + view.bottom) / 2} textAnchor="middle" fill={theme.muted} fontSize={theme.label.fontSize}>MISSING</text>;
  const y = (value: number) => mapBoxPlotY(value, domain, [view.bottom, view.top]);
  const yMin = y(datum.min!), yQ1 = y(datum.q1!), yMedian = y(datum.median!), yQ3 = y(datum.q3!), yMax = y(datum.max!);
  const color = markColor(datum, theme), medianColor = theme.background, cap = width * 0.62, motion = getBoxPlotMotion(theme.key, animate, datum.index);
  return <g data-box-mark={datum.label} data-focus={datum.focus ? "true" : "false"} data-x={x} data-box-width={width} data-min-y={yMin} data-q1-y={yQ1} data-median-y={yMedian} data-q3-y={yQ3} data-max-y={yMax} onMouseEnter={onEnter} onMouseLeave={onLeave} tabIndex={-1} style={{ opacity: motion.initialOpacity }}>
    {motion.enabled ? <animate data-mav-entry="box-plot" attributeName="opacity" from="0" to="1" dur={`${motion.duration}ms`} begin={`${motion.delay}ms`} fill="freeze" /> : null}
    <line data-box-whisker x1={x} x2={x} y1={yMax} y2={yMin} stroke={color} strokeWidth={theme.line.data} />
    <line data-box-cap="max" x1={x - cap / 2} x2={x + cap / 2} y1={yMax} y2={yMax} stroke={color} strokeWidth={theme.line.data} />
    <line data-box-cap="min" x1={x - cap / 2} x2={x + cap / 2} y1={yMin} y2={yMin} stroke={color} strokeWidth={theme.line.data} />
    <rect data-box-iqr x={x - width / 2} y={Math.min(yQ3, yQ1)} width={width} height={Math.abs(yQ1 - yQ3)} fill={color} fillOpacity={datum.focus ? 1 : theme.key === "signal" ? 0.96 : 0.82} stroke={color} strokeWidth={theme.line.hairline} />
    <line data-box-median x1={x - width / 2} x2={x + width / 2} y1={yMedian} y2={yMedian} stroke={medianColor} strokeWidth={theme.line.emphasis} />
    {(datum.outliers ?? []).map((outlier, index) => <circle key={`${outlier}-${index}`} data-box-outlier={outlier} cx={x} cy={y(outlier)} r={3.2} fill="none" stroke={color} strokeWidth={1.8} />)}
    <text data-box-direct-median x={x} y={Math.min(yQ3, yQ1) - 8} textAnchor="middle" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>MEDIAN {formatBoxPlotValue(datum.median!)}{unit}</text>
  </g>;
}

export function BoxPlotGeometry({ data, theme, animate = true, unit = "" }: { data: readonly BoxPlotDatum[]; theme: VisualSystemTokens; animate?: boolean; unit?: string }) {
  const geometry = buildBoxPlotGeometry(data), domain = getBoxPlotDomain(data);
  const [hovered, setHovered] = useState<number | null>(null), [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null), [size, setSize] = useState({ width: 960, height: 430 });
  useEffect(() => {
    const node = svgRef.current;
    if (!node) return;
    const update = () => { const box = node.getBoundingClientRect(); if (box.width > 0 && box.height > 0) setSize({ width: box.width, height: box.height }); };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update); observer.observe(node); return () => observer.disconnect();
  }, []);
  const compact = size.width < 520, view: PlotView = { width: size.width, height: size.height, left: compact ? 46 : 72, right: size.width - (compact ? 12 : 32), top: 24, bottom: size.height - 34 };
  const activeIndex = hovered ?? keyboardIndex, active = activeIndex === null ? null : geometry[activeIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => { if (!geometry.length || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return; event.preventDefault(); setKeyboardIndex((current) => event.key === "Home" ? 0 : event.key === "End" ? geometry.length - 1 : event.key === "ArrowRight" ? ((current ?? 0) + 1) % geometry.length : ((current ?? 0) - 1 + geometry.length) % geometry.length); };
  const ticks = Array.from({ length: 5 }, (_, index) => domain[0] + ((domain[1] - domain[0]) * index) / 4);
  const summary = (datum: BoxPlotGeometryDatum) => datum.missing ? "Missing" : `Min ${formatBoxPlotValue(datum.min!)}${unit}; Q1 ${formatBoxPlotValue(datum.q1!)}${unit}; Median ${formatBoxPlotValue(datum.median!)}${unit}; Q3 ${formatBoxPlotValue(datum.q3!)}${unit}; Max ${formatBoxPlotValue(datum.max!)}${unit}; Outliers ${(datum.outliers ?? []).length ? datum.outliers!.map(formatBoxPlotValue).join(", ") : "none"}`;
  return <div role="group" aria-label="Box plot interactive chart" data-box-animation={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={onKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none", display: "grid", gridTemplateRows: "auto minmax(0, 1fr)" }}>
    <div role="list" aria-label="Box plot legend" data-box-legend style={{ position: "relative", zIndex: 3, justifySelf: "end", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: theme.legend.gap, padding: "0 8px 4px", color: theme.muted, fontSize: theme.legend.fontSize }}><span role="listitem" style={{ color: theme.primary }}>■ Focus distribution</span><span role="listitem" style={{ color: theme.secondary }}>■ Context distributions</span><span role="listitem">Box = Q1–Q3 · line = median · whiskers = min/max · ○ outlier</span><span role="listitem">Missing = no mark</span></div>
    <svg ref={svgRef} data-box-svg viewBox={`0 0 ${view.width} ${view.height}`} width="100%" height="100%" role="img" aria-label="Box plots with five-number summaries and optional outliers">
      {ticks.map((tick) => { const y = mapBoxPlotY(tick, domain, [view.bottom, view.top]); return <g key={tick}><line x1={view.left} x2={view.right} y1={y} y2={y} stroke={theme.grid} strokeWidth={1} strokeDasharray={theme.chart.gridDash} /><text x={view.left - 8} y={y + 3} textAnchor="end" fill={theme.muted} fontSize={theme.label.fontSize}>{formatBoxPlotValue(tick)}</text></g>; })}
      {geometry.map((datum) => <BoxMark key={datum.label} datum={datum} count={geometry.length} domain={domain} theme={theme} animate={animate} unit={unit} view={view} onEnter={() => setHovered(datum.index)} onLeave={() => setHovered(null)} />)}
      {geometry.map((datum) => <text key={datum.label} x={getBoxPlotX(datum.index, geometry.length, [view.left, view.right])} y={view.bottom + 22} textAnchor="middle" fill={theme.muted} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>{formatBoxPlotLabel(datum.label, compact ? 9 : 13)}</text>)}
    </svg>
    {active ? <div data-box-tooltip={hovered !== null ? "mouse" : "keyboard"} role={hovered !== null ? undefined : "status"} style={{ position: "absolute", zIndex: 5, right: 8, bottom: 4, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{active.label}</strong><div>{summary(active)}</div>{active.detail ? <small style={{ color: theme.muted }}>{active.detail}</small> : null}</div> : null}
    <AccessibleDataTable caption="Box plot five-number summaries" rows={geometry} columns={[{ key: "label", label: "Category", value: (row) => row.label }, { key: "min", label: "Minimum", value: (row) => row.min ?? "Missing" }, { key: "q1", label: "Q1", value: (row) => row.q1 ?? "Missing" }, { key: "median", label: "Median", value: (row) => row.median ?? "Missing" }, { key: "q3", label: "Q3", value: (row) => row.q3 ?? "Missing" }, { key: "max", label: "Maximum", value: (row) => row.max ?? "Missing" }, { key: "outliers", label: "Outliers", value: (row) => row.missing ? "Missing" : (row.outliers ?? []).join(", ") || "None" }]} />
  </div>;
}

export function BoxPlotChart({ data = boxPlotExample, visualSystem = "signal", animate, title = "Core has the widest operating spread", subtitle = "PRECOMPUTED FIVE-NUMBER SUMMARY · OUTLIERS OUTSIDE WHISKERS", unit = "" }: BoxPlotChartProps) {
  const theme = getVisualSystem(visualSystem), validation = validateBoxPlotData(data), state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="D04" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · BOX PLOT`} theme={theme} state={state} description="Precomputed five-number summaries with honest whiskers, quartile boxes, medians and outliers."><BoxPlotGeometry data={validation.valid ? data : []} theme={theme} animate={resolveBoxPlotAnimation(animate, usePrefersReducedMotion())} unit={unit} /></ChartShell>;
}
export { buildBoxPlotGeometry, getBoxPlotDomain, getBoxPlotWidth, getBoxPlotX, mapBoxPlotY, validateBoxPlotData } from "./schema";
export type { BoxPlotDatum, BoxPlotGeometryDatum } from "./schema";
export { boxPlotExample, boxPlotEdgeCases } from "./example-data";
export { boxPlotMetadata } from "./metadata";
