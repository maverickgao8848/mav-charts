import { useLayoutEffect, useRef, useState } from "react";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { dumbbellExample } from "./example-data";
import { getDumbbellMotion } from "./motion";
import { buildDumbbellGeometry, getDumbbellDomain, validateDumbbellData, type DumbbellDatum } from "./schema";

export type DumbbellChartProps = {
  data?: readonly DumbbellDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
};

export const formatDumbbellLabel = (label: string) => label.length > 15 ? `${label.slice(0, 14)}…` : label;
export const resolveDumbbellAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;

export function DumbbellGeometry({ data, theme, animate = true }: { data: readonly DumbbellDatum[]; theme: VisualSystemTokens; animate?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || typeof ResizeObserver === "undefined") return;
    const update = () => setCompact(element.getBoundingClientRect().width < 520);
    update();
    const observer = new ResizeObserver(update);
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  const plotLeft = compact ? 96 : 118;
  const plotRight = compact ? 338 : 532;
  const geometry = buildDumbbellGeometry(data, plotLeft, plotRight);
  const domain = getDumbbellDomain(data);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const rowGap = compact ? Math.min(70, 280 / Math.max(1, data.length - 1)) : Math.min(58, 270 / Math.max(1, data.length - 1));
  const active = activeIndex === null ? null : geometry[activeIndex];
  const viewWidth = compact ? 360 : 560;
  const viewHeight = compact ? 440 : 360;
  const gridTop = compact ? 54 : 28;
  const gridBottom = compact ? 398 : 326;
  const axisY = compact ? 429 : 349;

  return (
    <div ref={containerRef} data-animation-enabled={animate ? "true" : "false"} style={{ position: "relative", width: "100%", height: "100%" }}>
      <div role="list" aria-label="Legend" style={{ position: "absolute", zIndex: 2, top: 2, right: 8, display: "flex", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
        {[["Before", theme.surface, theme.primary], ["After", theme.secondary, theme.secondary]].map(([label, fill, border]) => <span role="listitem" key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize, height: theme.legend.iconSize, borderRadius: "50%", background: fill, border: `1px solid ${border}` }} />{label}</span>)}
      </div>
      <svg viewBox={`0 0 ${viewWidth} ${viewHeight}`} width="100%" height="100%" role="img" aria-label="Before and after comparison by category">
        {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
          const x = plotLeft + ratio * (plotRight - plotLeft);
          const value = domain[0] + ratio * (domain[1] - domain[0]);
          return <g key={ratio}><line x1={x} x2={x} y1={gridTop} y2={gridBottom} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} /><text x={x} y={axisY} fill={theme.muted} fontSize={theme.label.fontSize} textAnchor="middle">{Math.round(value)}</text></g>;
        })}
        {geometry.map((datum, index) => {
          const y = data.length === 1 ? viewHeight / 2 : (compact ? 92 : 50) + index * rowGap;
          const activeRow = activeIndex === index;
          const motion = getDumbbellMotion(theme.key, animate, index);
          return (
            <g key={`${datum.label}-${index}`} opacity={motion.initialOpacity} tabIndex={0} role="graphics-symbol" aria-label={`${datum.label}: ${datum.before} to ${datum.after}, change ${datum.delta}`} onFocus={() => setActiveIndex(index)} onBlur={() => setActiveIndex(null)} onMouseEnter={() => setActiveIndex(index)} onMouseLeave={() => setActiveIndex(null)}>
              {motion.enabled ? <animate data-mav-entry="opacity" attributeName="opacity" from="0" to="1" dur={`${motion.durationMs}ms`} begin={`${motion.delayMs}ms`} fill="freeze" /> : null}
              <title>{`${datum.label}: ${datum.before} to ${datum.after}`}</title>
              <text x={compact ? 4 : 8} y={y + 4} fill={activeRow ? theme.text : theme.muted} fontSize={theme.label.fontSize + 1} fontWeight={theme.label.fontWeight}>{formatDumbbellLabel(datum.label)}</text>
              <line x1={datum.beforeX} x2={datum.afterX} y1={y} y2={y} stroke={datum.direction === "down" ? theme.fourth : theme.grid} strokeWidth={activeRow ? theme.line.emphasis : theme.line.data}>{motion.enabled ? <animate data-mav-entry="connector" attributeName="x2" from={datum.beforeX} to={datum.afterX} dur={`${motion.durationMs}ms`} begin={`${motion.delayMs}ms`} fill="freeze" /> : null}</line>
              <circle cx={datum.beforeX} cy={y} r="7" fill={theme.surface} stroke={theme.primary} strokeWidth={2} />
              <circle cx={datum.afterX} cy={y} r="8" fill={datum.direction === "down" ? theme.fourth : theme.secondary} />
              <text x={datum.beforeX} y={y + 21} fill={theme.primary} fontSize={theme.label.fontSize} textAnchor="middle">{datum.before}</text>
              <text x={datum.afterX} y={y - 13} fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight} textAnchor="middle">{datum.after}</text>
            </g>
          );
        })}
      </svg>
      {active ? <div role="status" style={{ position: "absolute", right: 8, top: 8, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {active.before} → {active.after} ({active.delta >= 0 ? "+" : ""}{active.delta})</div> : null}
      <AccessibleDataTable caption="Before and after values" rows={geometry} columns={[{ key: "label", label: "Category", value: (row) => row.label }, { key: "before", label: "Before", value: (row) => row.before }, { key: "after", label: "After", value: (row) => row.after }, { key: "delta", label: "Change", value: (row) => row.delta }]} />
    </div>
  );
}

export function DumbbellChart({ data = dumbbellExample, visualSystem = "editorial", animate, title = "Regions moved—just not together", subtitle = "2024 → 2026 · INDEXED PERFORMANCE" }: DumbbellChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveDumbbellAnimation(animate, reducedMotion);
  const validation = validateDumbbellData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="C11" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · DUMBBELL`} theme={theme} state={state} description="Paired values connected by category."><DumbbellGeometry data={data} theme={theme} animate={shouldAnimate} /></ChartShell>;
}

export { buildDumbbellGeometry, getDumbbellDomain, validateDumbbellData } from "./schema";
export type { DumbbellDatum, DumbbellGeometryDatum } from "./schema";
export { dumbbellExample, dumbbellEdgeCases } from "./example-data";
export { dumbbellMetadata } from "./metadata";
