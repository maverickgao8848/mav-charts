import { useMemo, useState, type KeyboardEvent } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, type PieLabelRenderProps } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { labelledDonutExample } from "./example-data";
import { getLabelledDonutMotion } from "./motion";
import { buildLabelledDonutGeometry, layoutLabelledDonutLabels, validateLabelledDonutData, type LabelledDonutDatum, type LabelledDonutGeometryDatum } from "./schema";

export type LabelledDonutChartProps = {
  data?: readonly LabelledDonutDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  unit?: string;
};

export const formatLabelledDonutValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const formatLabelledDonutLabel = (label: string, maximum = 20) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatLabelledDonutShare = (share: number | null) => share === null ? "N/A" : `${Number((share * 100).toFixed(1))}%`;
export const resolveLabelledDonutAnimation = (animate: boolean | undefined, reduced: boolean) => animate ?? !reduced;

const colors = (theme: VisualSystemTokens) => [theme.secondary, theme.fourth, theme.tertiary, theme.grid] as const;

function DonutTooltip({ datum, theme, unit }: { datum: LabelledDonutGeometryDatum; theme: VisualSystemTokens; unit: string }) {
  return <div role="tooltip" data-labelled-donut-tooltip style={{ position: "absolute", zIndex: 6, right: 8, bottom: 4, maxWidth: "68%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{formatLabelledDonutValue(datum.value!)}{unit} · {formatLabelledDonutShare(datum.share)}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function LabelledDonutGeometry({ data, theme, animate = true, unit = "" }: { data: readonly LabelledDonutDatum[]; theme: VisualSystemTokens; animate?: boolean; unit?: string }) {
  const built = useMemo(() => buildLabelledDonutGeometry(data), [data]),
    labelPositions = useMemo(() => layoutLabelledDonutLabels(built.geometry), [built.geometry]),
    labelMap = new Map(labelPositions.map((position) => [position.index, position])),
    motion = getLabelledDonutMotion(theme.key, animate),
    palette = colors(theme),
    [hoveredIndex, setHoveredIndex] = useState<number | null>(null),
    [keyboardIndex, setKeyboardIndex] = useState<number | null>(null),
    hovered = hoveredIndex === null ? null : built.geometry[hoveredIndex],
    active = keyboardIndex === null ? null : built.geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!built.geometry.length || !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => event.key === "Home" ? 0 : event.key === "End" ? built.geometry.length - 1 : ["ArrowRight", "ArrowDown"].includes(event.key) ? ((current ?? 0) + 1) % built.geometry.length : ((current ?? 0) - 1 + built.geometry.length) % built.geometry.length);
  };
  const describe = (datum: LabelledDonutGeometryDatum) => `${datum.label}: ${datum.missing ? "Missing" : datum.zero ? "Zero" : `${formatLabelledDonutValue(datum.value!)}${unit}; share ${formatLabelledDonutShare(datum.share)}`}${datum.focus ? "; largest reported slice" : ""}`;
  const renderLabel = (props: PieLabelRenderProps) => {
    const datum = props.payload as LabelledDonutGeometryDatum,
      position = labelMap.get(datum.index),
      cx = Number(props.cx), cy = Number(props.cy), radius = Number(props.outerRadius),
      radians = datum.midAngle * Math.PI / 180;
    if (!position || !Number.isFinite(cx + cy + radius)) return null;
    const startX = cx + Math.cos(radians) * (radius + 3), startY = cy + Math.sin(radians) * (radius + 3),
      elbowX = cx + position.x * radius * 0.84,
      labelX = cx + position.x * radius * 0.88,
      labelY = cy + position.y * radius * 0.94,
      anchor = position.side === "right" ? "start" : "end";
    return <g data-labelled-donut-label={datum.label} data-label-side={position.side} data-label-y={position.y} onMouseEnter={() => setHoveredIndex(datum.index)} onMouseLeave={() => setHoveredIndex(null)}>
      <polyline data-labelled-donut-leader points={`${startX},${startY} ${elbowX},${labelY} ${labelX + (position.side === "right" ? -5 : 5)},${labelY}`} fill="none" stroke={datum.focus ? theme.primary : theme.muted} strokeWidth={theme.line.hairline} />
      <text data-labelled-donut-label-content x={labelX} y={labelY - 2} textAnchor={anchor} fill={datum.focus ? theme.primary : theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>
        <tspan data-labelled-donut-label-text>{formatLabelledDonutLabel(datum.label, 14)}</tspan>
        <tspan x={labelX} dy={theme.label.fontSize + 3}>{formatLabelledDonutShare(datum.share)} · {formatLabelledDonutValue(datum.value!)}{unit}</tspan>
      </text>
    </g>;
  };

  return <div role="group" aria-label="Labelled donut interactive chart" tabIndex={0} onFocus={() => { setHoveredIndex(null); setKeyboardIndex((current) => current ?? 0); }} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} data-labelled-donut-animation={motion.enabled ? "true" : "false"} data-total={built.total} data-rendered-count={built.renderable.length} data-missing-count={built.geometry.filter((datum) => datum.missing).length} data-zero-count={built.geometry.filter((datum) => datum.zero).length} style={{ position: "relative", width: "100%", height: "100%", outline: "none", display: "grid", gridTemplateRows: "auto minmax(0,1fr)" }}>
    <div role="list" aria-label="Labelled donut legend" data-labelled-donut-legend style={{ zIndex: 4, justifySelf: "end", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: theme.legend.gap, padding: "0 8px 2px", color: theme.muted, fontSize: theme.legend.fontSize }}><span role="listitem"><b style={{ color: theme.primary }}>●</b> Largest slice</span><span role="listitem"><b style={{ color: theme.secondary }}>●</b> Reported composition</span><span role="listitem">Angle = value / reported total</span><span role="listitem">Missing/zero = no sector</span></div>
    <div data-labelled-donut-plot style={{ position: "relative", minHeight: 0 }}>
      {built.renderable.length ? <ResponsiveContainer width="100%" height="100%"><PieChart>
        <Pie data={built.renderable} dataKey="value" nameKey="label" cx="50%" cy="52%" innerRadius="30%" outerRadius="58%" startAngle={90} endAngle={-270} paddingAngle={0} stroke={theme.background} strokeWidth={3} labelLine={false} label={renderLabel} isAnimationActive={motion.enabled} animationDuration={motion.duration} animationEasing="ease-out" data-mav-entry={motion.enabled ? "labelled-donut" : undefined} onMouseEnter={(_, index) => setHoveredIndex(built.renderable[index]?.index ?? null)} onMouseLeave={() => setHoveredIndex(null)}>
          {built.renderable.map((datum, index) => <Cell key={datum.label} data-labelled-donut-sector={datum.label} data-start-angle={datum.startAngle} data-end-angle={datum.endAngle} data-angle={datum.endAngle - datum.startAngle} data-focus={datum.focus ? "true" : "false"} fill={datum.focus ? theme.primary : palette[index % palette.length]} />)}
        </Pie>
      </PieChart></ResponsiveContainer> : <div data-labelled-donut-no-area style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: theme.muted, fontSize: theme.label.fontSize }}>NO POSITIVE REPORTED AREA</div>}
      <div data-labelled-donut-center aria-hidden="true" style={{ position: "absolute", zIndex: 3, left: "50%", top: "52%", transform: "translate(-50%,-50%)", display: "grid", textAlign: "center", pointerEvents: "none", color: theme.text }}><strong style={{ fontFamily: theme.display, fontSize: 28, lineHeight: 1 }}>{formatLabelledDonutValue(built.total)}{unit}</strong><span style={{ marginTop: 5, color: theme.muted, fontSize: theme.label.fontSize }}>REPORTED TOTAL</span></div>
    </div>
    {hovered ? <DonutTooltip datum={hovered} theme={theme} unit={unit} /> : null}
    {active && hovered === null ? <div role="status" data-labelled-donut-keyboard-tooltip style={{ position: "absolute", zIndex: 6, right: 8, bottom: 4, maxWidth: "72%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{describe(active)}</div> : null}
    <AccessibleDataTable caption="Labelled donut composition" rows={built.geometry} columns={[{ key: "label", label: "Category", value: (row) => row.label }, { key: "value", label: "Value", value: (row) => row.value ?? "Missing" }, { key: "share", label: "Share of reported total", value: (row) => formatLabelledDonutShare(row.share) }, { key: "status", label: "Status", value: (row) => row.missing ? "Missing" : row.zero ? "Zero" : "Reported" }, { key: "detail", label: "Detail", value: (row) => row.detail ?? "" }]} />
  </div>;
}

export function LabelledDonutChart({ data = labelledDonutExample, visualSystem = "digital", animate, title = "Direct sales account for half of reported mix", subtitle = "CHANNEL MIX · ANGLE = REPORTED SHARE", unit = "" }: LabelledDonutChartProps) {
  const theme = getVisualSystem(visualSystem), reduced = usePrefersReducedMotion(), shouldAnimate = resolveLabelledDonutAnimation(animate, reduced), validation = validateLabelledDonutData(data), state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="P03" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · LABELLED DONUT`} theme={theme} state={state} description="A directly labelled donut whose slice angles are proportional to the reported positive total."><LabelledDonutGeometry data={data} theme={theme} animate={shouldAnimate} unit={unit} /></ChartShell>;
}

export { buildLabelledDonutGeometry, getLabelledDonutAngle, layoutLabelledDonutLabels, validateLabelledDonutData } from "./schema";
export type { LabelledDonutDatum, LabelledDonutGeometryDatum, LabelledDonutLabelPosition } from "./schema";
export { labelledDonutExample, labelledDonutEdgeCases } from "./example-data";
export { labelledDonutMetadata } from "./metadata";
