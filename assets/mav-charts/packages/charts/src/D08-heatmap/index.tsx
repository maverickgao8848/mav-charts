import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { heatmapExample } from "./example-data";
import { getHeatmapCellMotion } from "./motion";
import { buildHeatmapGeometry, getHeatmapDomain, normalizeHeatmapValue, validateHeatmapData, type HeatmapDatum, type HeatmapGeometryDatum } from "./schema";

export type HeatmapChartProps = {
  data?: readonly HeatmapDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
};

export const formatHeatmapLabel = (label: string, maximum = 13) => label.length > maximum ? `${label.slice(0, maximum - 1)}…` : label;
export const formatHeatmapValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return String(value);
};
export const resolveHeatmapAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;

function useCompactHeatmap() {
  const ref = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  useEffect(() => {
    if (typeof ResizeObserver === "undefined" || !ref.current) return;
    const observer = new ResizeObserver(([entry]) => setCompact(entry.contentRect.width < 480));
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, compact };
}

const baseColor = (theme: VisualSystemTokens) => theme.key === "editorial" ? theme.secondary : theme.primary;

export function HeatmapGeometry({ data, theme, animate = true }: { data: readonly HeatmapDatum[]; theme: VisualSystemTokens; animate?: boolean }) {
  const geometry = buildHeatmapGeometry(data);
  const { ref, compact } = useCompactHeatmap();
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState<HeatmapGeometryDatum | null>(null);
  const active = keyboardIndex === null ? null : geometry.cells[keyboardIndex];
  const peak = geometry.cells.filter((cell) => cell.value !== null).reduce<HeatmapGeometryDatum | null>((current, cell) => !current || (cell.value as number) > (current.value as number) ? cell : current, null);
  const width = compact ? 360 : 560;
  const height = compact ? 500 : 360;
  const left = compact ? 96 : 108;
  const top = compact ? 74 : 54;
  const right = 14;
  const bottom = compact ? 60 : 45;
  const gap = compact ? 3 : 5;
  const cellWidth = Math.max(4, (width - left - right) / Math.max(1, geometry.columns.length) - gap);
  const cellHeight = Math.max(4, (height - top - bottom) / Math.max(1, geometry.rows.length) - gap);
  const xStep = cellWidth + gap;
  const yStep = cellHeight + gap;
  const color = baseColor(theme);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    const columns = Math.max(1, geometry.columns.length);
    setKeyboardIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.cells.length - 1;
      const start = current ?? 0;
      const row = Math.floor(start / columns);
      const column = start % columns;
      if (event.key === "ArrowRight") return row * columns + (column + 1) % columns;
      if (event.key === "ArrowLeft") return row * columns + (column - 1 + columns) % columns;
      if (event.key === "ArrowDown") return Math.min(geometry.cells.length - 1, start + columns);
      return Math.max(0, start - columns);
    });
  };

  return <div ref={ref} role="group" aria-label="Heatmap interactive grid" data-animation-enabled={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Continuous color scale and missing legend" style={{ position: "absolute", zIndex: 2, top: 1, left: 8, display: "flex", alignItems: "center", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      <span role="listitem">{formatHeatmapValue(geometry.domain[0])}</span><span role="listitem" aria-label="Low to high continuous scale" style={{ width: 78, height: 8, border: `1px solid ${theme.grid}`, background: `linear-gradient(90deg, ${theme.surfaceAlt}, ${color})` }} /><span role="listitem">{formatHeatmapValue(geometry.domain[1])}</span>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i aria-hidden="true" style={{ width: 9, height: 9, border: `1px dashed ${theme.muted}`, background: theme.surfaceAlt }} />Missing</span>
    </div>
    {peak ? <div aria-label={`Peak ${peak.value} at ${peak.row}, ${peak.column}`} style={{ position: "absolute", zIndex: 2, top: 0, right: 8, color: theme.text, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }}>PEAK · {formatHeatmapValue(peak.value as number)}</div> : null}
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="Heatmap cells" preserveAspectRatio="xMidYMid meet">
      {geometry.rows.map((row, rowIndex) => <text key={row} x={left - 8} y={top + rowIndex * yStep + cellHeight / 2 + 3} textAnchor="end" fill={theme.muted} fontSize={compact ? 9 : 10} fontWeight={theme.label.fontWeight}>{formatHeatmapLabel(row, compact ? 11 : 15)}</text>)}
      {geometry.columns.map((column, columnIndex) => <text key={column} x={left + columnIndex * xStep + cellWidth / 2} y={top + geometry.rows.length * yStep + 15} textAnchor="middle" fill={theme.muted} fontSize={compact ? 8 : 9}>{formatHeatmapLabel(column, compact ? 7 : 10)}</text>)}
      {geometry.cells.map((cell, index) => {
        const x = left + cell.columnIndex * xStep;
        const y = top + cell.rowIndex * yStep;
        const opacity = cell.normalized === null ? 1 : 0.28 + cell.normalized * 0.72;
        const motion = getHeatmapCellMotion(theme.key, animate, index);
        const isPeak = peak?.row === cell.row && peak.column === cell.column;
        return <rect key={`${cell.row}\u0000${cell.column}`} data-heatmap-cell={`${cell.row}/${cell.column}`} x={x} y={y} width={cellWidth} height={cellHeight} rx={theme.radius.mark} fill={cell.missing ? theme.surfaceAlt : color} fillOpacity={opacity} stroke={isPeak ? theme.tertiary : cell.missing ? theme.muted : theme.grid} strokeWidth={isPeak ? 2 : 1} strokeDasharray={cell.missing ? "3 3" : undefined} onMouseEnter={() => setHovered(cell)} onMouseLeave={() => setHovered(null)}>
          {motion.animate ? <animate data-mav-entry="heat-cell" attributeName="opacity" from="0" to={opacity} begin={`${motion.delayMs}ms`} dur={`${motion.durationMs}ms`} fill="freeze" /> : null}
        </rect>;
      })}
    </svg>
    {hovered ? <div role="tooltip" style={{ position: "absolute", zIndex: 4, right: 8, bottom: 4, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{hovered.row} · {hovered.column}</strong><div>{hovered.value === null ? "Missing" : `Value ${hovered.value}`}</div>{hovered.detail ? <small style={{ color: theme.muted }}>{hovered.detail}</small> : null}</div> : null}
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "76%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.row}, {active.column}: {active.value === null ? `Missing (${active.missing})` : active.value}</div> : null}
    <AccessibleDataTable caption="Complete heatmap grid" rows={geometry.cells} columns={[{ key: "row", label: "Row", value: (cell) => cell.row }, { key: "column", label: "Column", value: (cell) => cell.column }, { key: "value", label: "Value", value: (cell) => cell.value ?? "Missing" }, { key: "missing", label: "Missing type", value: (cell) => cell.missing ?? "Present" }, { key: "detail", label: "Detail", value: (cell) => cell.detail ?? "" }]} />
  </div>;
}

export function HeatmapChart({ data = heatmapExample, visualSystem = "digital", animate, title = "Wednesday noon is the pressure point", subtitle = "ACTIVITY DENSITY · DAY × HOUR" }: HeatmapChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveHeatmapAnimation(animate, reducedMotion);
  const validation = validateHeatmapData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="D08" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · HEATMAP`} theme={theme} state={state} description="A complete categorical grid with one honest continuous color domain and explicit missing cells."><HeatmapGeometry data={data} theme={theme} animate={shouldAnimate} /></ChartShell>;
}

export { buildHeatmapGeometry, getHeatmapDomain, normalizeHeatmapValue, validateHeatmapData } from "./schema";
export type { HeatmapDatum, HeatmapGeometryResult, HeatmapGeometryDatum } from "./schema";
export { heatmapExample, heatmapEdgeCases } from "./example-data";
export { heatmapMetadata } from "./metadata";
