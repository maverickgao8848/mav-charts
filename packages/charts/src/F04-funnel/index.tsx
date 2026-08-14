import { useState, type KeyboardEvent } from "react";
import { Funnel, FunnelChart, ResponsiveContainer, Tooltip } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { funnelExample } from "./example-data";
import { getFunnelMotion } from "./motion";
import { buildFunnelGeometry, validateFunnelData, type FunnelDatum, type FunnelGeometryDatum } from "./schema";

export type FunnelStageChartProps = { data?: readonly FunnelDatum[]; visualSystem?: VisualSystemId; animate?: boolean; title?: string; subtitle?: string; unit?: string };
export const resolveFunnelAnimation = (animate: boolean | undefined, reduced: boolean) => animate ?? !reduced;
export const formatFunnelLabel = (label: string, maximum = 19) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatFunnelValue = (value: number) => { const absolute = Math.abs(value); if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`; if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`; if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`; return Number(value.toFixed(4)).toString(); };
export const formatFunnelPercent = (ratio: number | null) => ratio === null ? "N/A" : `${Number((ratio * 100).toFixed(1))}%`;

type FunnelShapeProps = { x?: number; y?: number; upperWidth?: number; height?: number; payload?: FunnelGeometryDatum & { animate?: boolean }; theme: VisualSystemTokens; unit: string };
function funnelPath(x: number, y: number, upperWidth: number, lowerWidth: number, height: number) {
  const difference = upperWidth - lowerWidth;
  return `M ${x},${y} L ${x + upperWidth},${y} L ${x + upperWidth - difference / 2},${y + height} L ${x + difference / 2},${y + height} Z`;
}

function FunnelStageShape({ x = 0, y = 0, upperWidth: availableWidth = 0, height = 0, payload, theme, unit }: FunnelShapeProps) {
  if (!payload) return null;
  const motion = getFunnelMotion(theme.key, Boolean(payload.animate), payload.index);
  if (payload.missing) {
    const centerX = x + availableWidth / 2;
    const gapWidth = Math.min(96, Math.max(48, availableWidth * 0.16));
    return <g data-funnel-gap={payload.label} data-stage-index={payload.index} data-gap-kind="non-quantitative" data-no-quantitative-width="true">
      <line data-funnel-gap-line x1={centerX - gapWidth / 2} x2={centerX + gapWidth / 2} y1={y + height / 2} y2={y + height / 2} fill="none" stroke={theme.muted} strokeWidth={2} strokeDasharray="5 5" />
      <text x={centerX} y={y + height / 2 - 8} textAnchor="middle" fill={theme.muted} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>MISSING · WIDTH UNKNOWN</text>
    </g>;
  }
  const upperWidth = availableWidth * (payload.widthRatio ?? 0);
  const lowerWidth = availableWidth * (payload.nextWidthRatio ?? payload.widthRatio ?? 0);
  const stageX = x + (availableWidth - upperWidth) / 2;
  const path = funnelPath(stageX, y, upperWidth, lowerWidth, height), color = payload.focus ? theme.primary : theme.secondary;
  return <g data-funnel-stage={payload.label} data-stage-index={payload.index} data-value={payload.value ?? "missing"} data-focus={payload.focus ? "true" : "false"} data-width-ratio={payload.widthRatio ?? "missing"} data-upper-width={upperWidth} data-lower-width={lowerWidth} style={{ opacity: motion.initialOpacity }}>
    {motion.enabled ? <animate data-mav-entry="funnel" attributeName="opacity" from="0" to="1" dur={`${motion.duration}ms`} begin={`${motion.delay}ms`} fill="freeze" /> : null}
    <path data-funnel-path d={path} fill={color} fillOpacity={payload.focus ? 1 : theme.key === "signal" ? 0.96 : 0.82} stroke={theme.background} strokeWidth={2} />
    <text data-funnel-stage-label x={stageX - 10} y={y + height / 2 + 3} textAnchor="end" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>{formatFunnelLabel(payload.label)}</text>
    <text data-funnel-stage-value x={stageX + upperWidth + 10} y={y + height / 2 + 3} textAnchor="start" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>{formatFunnelValue(payload.value!)}{unit}</text>
    {payload.focus && payload.dropToNext !== null ? <text data-funnel-direct-loss x={stageX + upperWidth / 2} y={y + height / 2 + 3} textAnchor="middle" fill={theme.background} fontSize={theme.label.fontSize} fontWeight={900}>LOSS {formatFunnelValue(payload.dropToNext)}{unit}</text> : null}
  </g>;
}

function FunnelStageTooltip({ active, payload, theme, unit }: { active?: boolean; payload?: readonly { payload?: FunnelGeometryDatum }[]; theme: VisualSystemTokens; unit: string }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div data-funnel-tooltip style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>Value: {datum.value === null ? "Missing" : `${formatFunnelValue(datum.value)}${unit}`}</div><div>Conversion from previous: {formatFunnelPercent(datum.conversionFromPrevious)}</div><div>Loss from previous: {datum.lossFromPrevious === null ? "N/A" : `${formatFunnelValue(datum.lossFromPrevious)}${unit}`}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function FunnelStageGeometry({ data, theme, animate = true, unit = "" }: { data: readonly FunnelDatum[]; theme: VisualSystemTokens; animate?: boolean; unit?: string }) {
  const geometry = buildFunnelGeometry(data).map((datum) => ({ ...datum, animate }));
  const [hovered, setHovered] = useState<number | null>(null), [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const activeIndex = hovered ?? keyboardIndex, active = activeIndex === null ? null : geometry[activeIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => { if (!geometry.length || !["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return; event.preventDefault(); setKeyboardIndex((current) => event.key === "Home" ? 0 : event.key === "End" ? geometry.length - 1 : ["ArrowDown", "ArrowRight"].includes(event.key) ? ((current ?? 0) + 1) % geometry.length : ((current ?? 0) - 1 + geometry.length) % geometry.length); };
  const describe = (datum: FunnelGeometryDatum) => `${datum.label}: ${datum.value === null ? "Missing" : `${formatFunnelValue(datum.value)}${unit}`}; conversion from previous ${formatFunnelPercent(datum.conversionFromPrevious)}; loss from previous ${datum.lossFromPrevious === null ? "N/A" : `${formatFunnelValue(datum.lossFromPrevious)}${unit}`}${datum.focus ? "; first largest loss" : ""}`;
  return <div role="group" aria-label="Funnel stage interactive chart" data-funnel-animation={animate ? "true" : "false"} data-stage-count={geometry.length} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={onKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none", display: "grid", gridTemplateRows: "auto minmax(0, 1fr)" }}>
    <div role="list" aria-label="Funnel legend" data-funnel-legend style={{ position: "relative", zIndex: 3, justifySelf: "end", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: theme.legend.gap, padding: "0 8px 4px", color: theme.muted, fontSize: theme.legend.fontSize }}><span role="listitem" style={{ color: theme.primary }}>■ First largest loss</span><span role="listitem" style={{ color: theme.secondary }}>■ Other stages</span><span role="listitem">Width = stage value</span><span role="listitem">┄ Missing = non-quantitative break</span></div>
    <ResponsiveContainer width="100%" height="100%">
      <FunnelChart margin={{ top: 12, right: 118, bottom: 12, left: 118 }} accessibilityLayer>
        <Tooltip content={({ active: tooltipActive, payload }) => <FunnelStageTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: FunnelGeometryDatum }[]} theme={theme} unit={unit} />} />
        <Funnel data={geometry} dataKey="layoutWeight" nameKey="label" isAnimationActive={animate} animationDuration={getFunnelMotion(theme.key, animate).duration} lastShapeType="rectangle" shape={(props: unknown) => <FunnelStageShape {...(props as Omit<FunnelShapeProps, "theme" | "unit">)} theme={theme} unit={unit} />} onMouseEnter={(_, index) => setHovered(index)} onMouseLeave={() => setHovered(null)} />
      </FunnelChart>
    </ResponsiveContainer>
    {active && hovered === null ? <div role="status" data-funnel-keyboard-tooltip style={{ position: "absolute", zIndex: 5, right: 8, bottom: 4, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{describe(active)}</div> : null}
    <AccessibleDataTable caption="Ordered funnel stages" rows={geometry} columns={[{ key: "stage", label: "Stage", value: (row) => row.label }, { key: "value", label: "Value", value: (row) => row.value ?? "Missing" }, { key: "conversion", label: "Conversion from previous", value: (row) => formatFunnelPercent(row.conversionFromPrevious) }, { key: "loss", label: "Loss from previous", value: (row) => row.lossFromPrevious ?? "N/A" }, { key: "focus", label: "Focus", value: (row) => row.focus ? "First largest loss" : "No" }]} />
  </div>;
}

export function FunnelStageChart({ data = funnelExample, visualSystem = "signal", animate, title = "The largest loss happens after market leads", subtitle = "ORDERED CONVERSION STAGES · WIDTH = VALUE", unit = "" }: FunnelStageChartProps) {
  const theme = getVisualSystem(visualSystem), validation = validateFunnelData(data), state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="F04" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · FUNNEL`} theme={theme} state={state} description="An ordered subset funnel with widths proportional to stage values and explicit adjacent conversion losses."><FunnelStageGeometry data={validation.valid ? data : []} theme={theme} animate={resolveFunnelAnimation(animate, usePrefersReducedMotion())} unit={unit} /></ChartShell>;
}

export { buildFunnelGeometry, getFunnelWidthRatio, mapFunnelWidth, validateFunnelData } from "./schema";
export type { FunnelDatum, FunnelGeometryDatum } from "./schema";
export { funnelExample, funnelEdgeCases } from "./example-data";
export { funnelMetadata } from "./metadata";
