import { useState, type KeyboardEvent } from "react";
import { CartesianGrid, ReferenceLine, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis, ZAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { bubbleQuadrantExample } from "./example-data";
import { getBubbleQuadrantMotion } from "./motion";
import { buildBubbleQuadrantGeometry, getBubbleQuadrantDomains, validateBubbleQuadrantData, type BubbleQuadrantDatum, type BubbleQuadrantGeometryDatum, type BubbleQuadrantName, type BubbleQuadrantThresholds } from "./schema";

export type BubbleQuadrantChartProps = {
  data?: readonly BubbleQuadrantDatum[];
  thresholds?: BubbleQuadrantThresholds;
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
};

export const formatBubbleQuadrantLabel = (label: string, maximum = 13) => label.length > maximum ? `${label.slice(0, maximum - 1)}…` : label;
export const formatBubbleQuadrantValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return String(value);
};
export const resolveBubbleQuadrantAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;

const quadrantLabels: Record<BubbleQuadrantName, string> = { leaders: "Leaders", challengers: "Challengers", niche: "Niche", watch: "Watch" };
const quadrantColors = (theme: VisualSystemTokens): Record<BubbleQuadrantName, string> => ({ leaders: theme.primary, challengers: theme.secondary, niche: theme.tertiary, watch: theme.fourth });

type ShapeProps = { cx?: number; cy?: number; payload?: BubbleQuadrantGeometryDatum & { fill?: string; fillOpacity?: number; animate?: boolean }; theme: VisualSystemTokens };

function BubbleShape({ cx = 0, cy = 0, payload, theme }: ShapeProps) {
  if (!payload) return null;
  const labelY = cy - Math.max(payload.radius, 4) - 6 + payload.labelDy;
  return <g data-bubble-label={payload.label}>
    <circle cx={cx} cy={cy} r={payload.radius} fill={payload.fill} fillOpacity={payload.fillOpacity ?? 0.68} stroke={theme.text} strokeWidth={payload.radius === 0 ? 0 : 1}>
      {payload.animate && payload.radius > 0 ? <animate data-mav-entry="bubble" attributeName="r" from="0" to={payload.radius} dur="0.7s" fill="freeze" /> : null}
    </circle>
    <text x={cx + payload.labelDx} y={labelY} textAnchor={payload.labelDx < 0 ? "end" : "middle"} fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>{formatBubbleQuadrantLabel(payload.label)}</text>
  </g>;
}

function BubbleQuadrantTooltip({ active, payload, theme }: { active?: boolean; payload?: readonly { payload?: BubbleQuadrantGeometryDatum }[]; theme: VisualSystemTokens }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>X {datum.x} · Y {datum.y}</div><div>Size {datum.size}</div><small style={{ color: theme.muted }}>{quadrantLabels[datum.quadrant]}{datum.detail ? ` · ${datum.detail}` : ""}</small></div>;
}

export function BubbleQuadrantGeometry({ data, theme, thresholds = { x: 50, y: 50 }, animate = true }: { data: readonly BubbleQuadrantDatum[]; theme: VisualSystemTokens; thresholds?: BubbleQuadrantThresholds; animate?: boolean }) {
  const colors = quadrantColors(theme);
  const baseGeometry = buildBubbleQuadrantGeometry(data, thresholds);
  const signalSizeRanks = new Map(
    [...baseGeometry]
      .sort((left, right) => right.size - left.size)
      .map((datum, rank) => [datum.index, rank] as const),
  );
  const geometry = baseGeometry.map((datum) => {
    const rank = signalSizeRanks.get(datum.index) ?? Number.POSITIVE_INFINITY;
    const signalFill = rank < 2 ? theme.primary : rank === 2 ? theme.secondary : datum.quadrant === "watch" ? theme.fourth : theme.tertiary;
    const signalOpacity = rank < 2 ? 0.94 : rank === 2 ? 0.92 : 0.68;
    return { ...datum, fill: theme.key === "signal" ? signalFill : colors[datum.quadrant], fillOpacity: theme.key === "signal" ? signalOpacity : 0.68, animate };
  });
  const domains = getBubbleQuadrantDomains(data, thresholds);
  const motion = getBubbleQuadrantMotion(theme.key, animate);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.length - 1;
      const start = current ?? 0;
      return ["ArrowDown", "ArrowRight"].includes(event.key) ? (start + 1) % geometry.length : (start - 1 + geometry.length) % geometry.length;
    });
  };

  return <div role="group" aria-label="Bubble quadrant interactive chart" data-animation-enabled={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Quadrant and size legend" style={{ position: "absolute", zIndex: 2, top: 1, left: 8, right: 8, display: "flex", flexWrap: "wrap", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      {theme.key === "signal"
        ? [["Focus", theme.primary], ["Context", theme.secondary], ["Watch", theme.fourth]].map(([label, color]) => <span role="listitem" key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize, height: theme.legend.iconSize, borderRadius: "50%", background: color }} />{label}</span>)
        : (Object.keys(quadrantLabels) as BubbleQuadrantName[]).map((quadrant) => <span role="listitem" key={quadrant} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize, height: theme.legend.iconSize, borderRadius: "50%", background: colors[quadrant] }} />{quadrantLabels[quadrant]}</span>)}
      <span role="listitem">Bubble area = size</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 36, right: 22, left: -5, bottom: 8 }} accessibilityLayer>
        <CartesianGrid stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis type="number" dataKey="x" domain={[...domains.x]} tickFormatter={(value) => formatBubbleQuadrantValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} />
        <YAxis type="number" dataKey="y" domain={[...domains.y]} tickFormatter={(value) => formatBubbleQuadrantValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} />
        <ZAxis type="number" dataKey="size" range={[0, 1000]} />
        <ReferenceLine x={thresholds.x} stroke={theme.muted} strokeDasharray="5 7" />
        <ReferenceLine y={thresholds.y} stroke={theme.muted} strokeDasharray="5 7" />
        <Tooltip cursor={{ stroke: theme.muted, strokeDasharray: "4 4" }} content={({ active: tooltipActive, payload }) => <BubbleQuadrantTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: BubbleQuadrantGeometryDatum }[]} theme={theme} />} />
        <Scatter data={geometry} shape={(props: unknown) => <BubbleShape {...(props as Omit<ShapeProps, "theme">)} theme={theme} />} {...motion} />
      </ScatterChart>
    </ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "78%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: X {active.x}; Y {active.y}; size {active.size}; {quadrantLabels[active.quadrant]}</div> : null}
    <AccessibleDataTable caption="Bubble quadrant values" rows={geometry} columns={[{ key: "label", label: "Item", value: (row) => row.label }, { key: "x", label: "X", value: (row) => row.x }, { key: "y", label: "Y", value: (row) => row.y }, { key: "size", label: "Size", value: (row) => row.size }, { key: "quadrant", label: "Quadrant", value: (row) => quadrantLabels[row.quadrant] }]} />
  </div>;
}

export function BubbleQuadrantChart({ data = bubbleQuadrantExample, thresholds = { x: 50, y: 50 }, visualSystem = "signal", animate, title = "Two challengers escaped the price trap", subtitle = "PRICE INDEX × GROWTH · BUBBLE AREA = SHARE" }: BubbleQuadrantChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveBubbleQuadrantAnimation(animate, reducedMotion);
  const validation = validateBubbleQuadrantData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="D03" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · BUBBLE QUADRANT`} theme={theme} state={state} description="Two-axis positioning with area-proportional size bubbles and explicit thresholds."><BubbleQuadrantGeometry data={data} thresholds={thresholds} theme={theme} animate={shouldAnimate} /></ChartShell>;
}

export { buildBubbleQuadrantGeometry, getBubbleQuadrantDomains, validateBubbleQuadrantData } from "./schema";
export type { BubbleQuadrantDatum, BubbleQuadrantGeometryDatum, BubbleQuadrantName, BubbleQuadrantThresholds } from "./schema";
export { bubbleQuadrantExample, bubbleQuadrantEdgeCases } from "./example-data";
export { bubbleQuadrantMetadata } from "./metadata";
