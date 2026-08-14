import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { timelineExample } from "./example-data";
import { getTimelineItemMotion } from "./motion";
import { buildTimelineGeometry, getTimelineDomain, mapTimelineX, validateTimelineData, type TimelineDatum, type TimelineGeometryDatum } from "./schema";

export type TimelineChartProps = {
  data?: readonly TimelineDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
};

export const formatTimelineLabel = (label: string, maximum = 15) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatTimelineValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 100_000) return compact(1_000, "K");
  return Number(value.toFixed(2)).toString();
};
export const formatTimelineDuration = (duration: number) => formatTimelineValue(duration);
export const resolveTimelineAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;

function useCompactTimeline() {
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

const itemColors = (theme: VisualSystemTokens) => [theme.primary, theme.secondary, theme.tertiary, theme.fourth] as const;

export function TimelineGeometry({ data, theme, animate = true }: { data: readonly TimelineDatum[]; theme: VisualSystemTokens; animate?: boolean }) {
  const geometry = buildTimelineGeometry(data);
  const colors = itemColors(theme);
  const { ref, compact } = useCompactTimeline();
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const [hovered, setHovered] = useState<TimelineGeometryDatum | null>(null);
  const active = keyboardIndex === null ? null : geometry.items[keyboardIndex];
  const width = compact ? 360 : 560;
  const height = compact ? 500 : 360;
  const left = compact ? 38 : 52;
  const right = compact ? 16 : 20;
  const top = compact ? 88 : 74;
  const bottom = compact ? 64 : 54;
  const laneHeight = (height - top - bottom) / geometry.laneCount;
  const barHeight = Math.max(10, Math.min(24, laneHeight * 0.32));
  const range = [left, width - right] as const;
  const ticks = Array.from({ length: 5 }, (_, index) => geometry.domain[0] + ((geometry.domain[1] - geometry.domain[0]) * index) / 4);
  const hasZero = geometry.domain[0] <= 0 && geometry.domain[1] >= 0;
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.items.length - 1;
      const start = current ?? 0;
      return event.key === "ArrowRight" ? (start + 1) % geometry.items.length : (start - 1 + geometry.items.length) % geometry.items.length;
    });
  };

  return <div ref={ref} role="group" aria-label="Timeline interactive chart" data-animation-enabled={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Timeline legend" style={{ position: "absolute", zIndex: 2, top: 2, left: 8, display: "flex", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: 18, height: 7, background: theme.primary, borderRadius: theme.radius.mark }} />Interval</span>
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: 7, height: 7, background: theme.tertiary, borderRadius: "50%" }} />Milestone</span>
      <span role="listitem">Lane = overlap only</span>
    </div>
    <svg viewBox={`0 0 ${width} ${height}`} width="100%" height="100%" role="img" aria-label="Timeline intervals" preserveAspectRatio="xMidYMid meet">
      {ticks.map((tick, index) => {
        const x = mapTimelineX(tick, geometry.domain, range);
        return <g key={index}><line x1={x} x2={x} y1={top - 12} y2={height - bottom + 8} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} /><text x={x} y={height - bottom + 26} textAnchor="middle" fill={theme.muted} fontSize={compact ? 8 : 10}>{formatTimelineValue(tick)}</text></g>;
      })}
      {hasZero ? <line x1={mapTimelineX(0, geometry.domain, range)} x2={mapTimelineX(0, geometry.domain, range)} y1={top - 16} y2={height - bottom + 8} stroke={theme.muted} strokeWidth="1.5" strokeDasharray="5 5" /> : null}
      {geometry.items.map((item, index) => {
        const startX = mapTimelineX(item.start, geometry.domain, range);
        const endX = mapTimelineX(item.end, geometry.domain, range);
        const y = top + item.lane * laneHeight + laneHeight / 2;
        const itemWidth = Math.max(0, endX - startX);
        const motion = getTimelineItemMotion(theme.key, animate, index);
        const color = colors[index % colors.length];
        return <g key={`${item.label}-${index}`} data-timeline-item={item.label} onMouseEnter={() => setHovered(item)} onMouseLeave={() => setHovered(null)}>
          {item.duration === 0 ? <circle cx={startX} cy={y} r={5} fill={color} stroke={theme.text} strokeWidth="1">{motion.animate ? <animate data-mav-entry="timeline-item" attributeName="r" from="0" to="5" begin={`${motion.delayMs}ms`} dur={`${motion.durationMs}ms`} fill="freeze" /> : null}</circle> : <rect x={startX} y={y - barHeight / 2} width={itemWidth} height={barHeight} rx={theme.radius.mark} fill={color} fillOpacity="0.82" stroke={theme.text} strokeWidth="0.8">{motion.animate ? <animate data-mav-entry="timeline-item" attributeName="width" from="0" to={itemWidth} begin={`${motion.delayMs}ms`} dur={`${motion.durationMs}ms`} fill="freeze" /> : null}</rect>}
          <text x={startX} y={y - barHeight / 2 - 7} textAnchor="start" fill={theme.text} fontSize={compact ? 9 : 10} fontWeight={theme.label.fontWeight}>{formatTimelineLabel(item.label, compact ? 12 : 18)}</text>
        </g>;
      })}
    </svg>
    {hovered ? <div role="tooltip" style={{ position: "absolute", zIndex: 4, right: 8, bottom: 4, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{hovered.label}</strong><div>{formatTimelineValue(hovered.start)} → {formatTimelineValue(hovered.end)}</div><div>Duration {formatTimelineDuration(hovered.duration)}</div>{hovered.detail ? <small style={{ color: theme.muted }}>{hovered.detail}</small> : null}</div> : null}
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "76%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {formatTimelineValue(active.start)} to {formatTimelineValue(active.end)}; duration {formatTimelineDuration(active.duration)}; lane {active.lane + 1}</div> : null}
    <AccessibleDataTable caption="Timeline intervals" rows={geometry.items} columns={[{ key: "label", label: "Phase", value: (item) => item.label }, { key: "start", label: "Start", value: (item) => formatTimelineValue(item.start) }, { key: "end", label: "End", value: (item) => formatTimelineValue(item.end) }, { key: "duration", label: "Duration", value: (item) => formatTimelineDuration(item.duration) }, { key: "lane", label: "Overlap lane", value: (item) => item.lane + 1 }, { key: "detail", label: "Detail", value: (item) => item.detail ?? "" }]} />
  </div>;
}

export function TimelineChart({ data = timelineExample, visualSystem = "editorial", animate, title = "Scale arrived before the market was ready", subtitle = "POLICY · CAPACITY · EXPORT MILESTONES" }: TimelineChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveTimelineAnimation(animate, reducedMotion);
  const validation = validateTimelineData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="F03" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · TIMELINE`} theme={theme} state={state} description="Intervals and milestones on one unbroken linear time scale with overlap lanes."><TimelineGeometry data={data} theme={theme} animate={shouldAnimate} /></ChartShell>;
}

export { buildTimelineGeometry, getTimelineDomain, mapTimelineX, validateTimelineData } from "./schema";
export type { TimelineDatum, TimelineGeometryDatum, TimelineGeometryResult } from "./schema";
export { timelineExample, timelineEdgeCases } from "./example-data";
export { timelineMetadata } from "./metadata";
