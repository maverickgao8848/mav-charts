import { useState, type KeyboardEvent } from "react";
import { Bar, BarChart, CartesianGrid, Rectangle, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { roundedColumnExample } from "./example-data";
import { getRoundedColumnMotion } from "./motion";
import { buildRoundedColumnGeometry, getControlledColumnRadius, getRoundedColumnDomain, validateRoundedColumnData, type RoundedColumnDatum, type RoundedColumnGeometryDatum } from "./schema";

export type RoundedColumnChartProps = {
  data?: readonly RoundedColumnDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  seriesName?: string;
  unit?: string;
  cornerRadius?: number;
};

export const formatRoundedColumnLabel = (label: string, maximum = 12) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatRoundedColumnValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return Number(value.toFixed(2)).toString();
};
export const resolveRoundedColumnAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;

const valueWithUnit = (value: number, unit: string) => `${formatRoundedColumnValue(value)}${unit ? ` ${unit}` : ""}`;

type RoundedShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  payload?: RoundedColumnGeometryDatum & { animate?: boolean };
  theme: VisualSystemTokens;
  unit: string;
  cornerRadius: number;
};

function RoundedShape({ x = 0, y = 0, width = 0, height = 0, payload, theme, unit, cornerRadius }: RoundedShapeProps) {
  if (!payload || payload.value === null) return null;
  const rectY = Math.min(y, y + height);
  const rectHeight = Math.abs(height);
  const radius = getControlledColumnRadius(width, rectHeight, cornerRadius);
  const positive = payload.value >= 0;
  const corners: [number, number, number, number] = positive ? [radius, radius, 0, 0] : [0, 0, radius, radius];
  const labelY = positive ? rectY - 7 : rectY + rectHeight + 14;
  const signalFocus = theme.key === "signal" && payload.focus;
  const fill = theme.key === "signal" ? (signalFocus ? theme.primary : theme.secondary) : theme.primary;
  return <g data-rounded-column={payload.label} data-controlled-radius={radius.toFixed(2)} data-column-focus={signalFocus ? "true" : "false"}>
    {payload.animate ? <animate data-mav-entry="rounded-column" attributeName="opacity" from="0" to="1" dur="0.7s" fill="freeze" /> : null}
    <Rectangle x={x} y={rectY} width={Math.max(0, width)} height={rectHeight} radius={corners} fill={fill} />
    <text x={x + width / 2} y={labelY} textAnchor="middle" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>{valueWithUnit(payload.value, unit)}</text>
  </g>;
}

function RoundedColumnTooltip({ active, payload, theme, seriesName, unit }: { active?: boolean; payload?: readonly { payload?: RoundedColumnGeometryDatum }[]; theme: VisualSystemTokens; seriesName: string; unit: string }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{seriesName}: {datum.value === null ? "Missing" : valueWithUnit(datum.value, unit)}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function RoundedColumnGeometry({ data, theme, animate = true, seriesName = "Score", unit = "", cornerRadius = 18 }: { data: readonly RoundedColumnDatum[]; theme: VisualSystemTokens; animate?: boolean; seriesName?: string; unit?: string; cornerRadius?: number }) {
  const domain = getRoundedColumnDomain(data);
  const motion = getRoundedColumnMotion(theme.key, animate);
  const geometry = buildRoundedColumnGeometry(data).map((datum) => ({ ...datum, animate }));
  const hasNegative = geometry.some(({ value }) => value !== null && value < 0);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (geometry.length === 0 || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.length - 1;
      const start = current ?? 0;
      return event.key === "ArrowRight" ? (start + 1) % geometry.length : (start - 1 + geometry.length) % geometry.length;
    });
  };

  return <div role="group" aria-label="Rounded columns interactive chart" data-rounded-animation={motion.isAnimationActive ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Rounded column legend" data-rounded-legend style={{ position: "absolute", zIndex: 2, top: 2, left: 8, display: "flex", flexWrap: "wrap", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      {theme.key === "signal" ? <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.primary, borderRadius: 999 }} />Focus</span> : null}
      <span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 4, height: theme.legend.iconSize, background: theme.key === "signal" ? theme.secondary : theme.primary, borderRadius: 999 }} />{seriesName}{unit ? ` · ${unit}` : ""}</span>
      <span role="listitem">Missing = gap</span>
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={geometry} margin={{ top: 48, right: 14, left: -4, bottom: 8 }} accessibilityLayer>
        <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis dataKey="label" interval={0} tickFormatter={(label) => formatRoundedColumnLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} />
        <YAxis domain={[...domain]} tickFormatter={(value) => formatRoundedColumnValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} width={44} />
        {hasNegative ? <ReferenceLine y={0} stroke={theme.secondary} strokeWidth={1.4} /> : null}
        <Tooltip cursor={{ fill: theme.grid, opacity: 0.18 }} content={({ active: tooltipActive, payload }) => <RoundedColumnTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: RoundedColumnGeometryDatum }[]} theme={theme} seriesName={seriesName} unit={unit} />} />
        <Bar dataKey="value" name={`${seriesName}${unit ? ` (${unit})` : ""}`} maxBarSize={128} shape={(props: unknown) => <RoundedShape {...(props as Omit<RoundedShapeProps, "theme" | "unit" | "cornerRadius">)} theme={theme} unit={unit} cornerRadius={cornerRadius} />} {...motion} />
      </BarChart>
    </ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "78%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {seriesName} {active.value === null ? "missing" : valueWithUnit(active.value, unit)}{active.detail ? `; ${active.detail}` : ""}</div> : null}
    <AccessibleDataTable caption="Rounded column values" rows={geometry} columns={[{ key: "label", label: "Category", value: (datum) => datum.label }, { key: "value", label: `${seriesName}${unit ? ` (${unit})` : ""}`, value: (datum) => datum.value ?? "Missing" }, { key: "detail", label: "Detail", value: (datum) => datum.detail ?? "" }]} />
  </div>;
}

export function RoundedColumnChart({ data = roundedColumnExample, visualSystem = "signal", animate, title = "Momentum is setting the pace", subtitle = "THREE PRIORITIES · CURRENT SCORE", seriesName = "Score", unit = "", cornerRadius = 18 }: RoundedColumnChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveRoundedColumnAnimation(animate, reducedMotion);
  const validation = validateRoundedColumnData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  const safeData = validation.valid ? data : [];
  return <ChartShell code="C02" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · ROUNDED COLUMNS`} theme={theme} state={state} description="A small-category vertical comparison with controlled rounded caps and an unbroken zero-based scale."><RoundedColumnGeometry data={safeData} theme={theme} animate={shouldAnimate} seriesName={seriesName} unit={unit} cornerRadius={cornerRadius} /></ChartShell>;
}

export { buildRoundedColumnGeometry, getControlledColumnRadius, getRoundedColumnDomain, validateRoundedColumnData } from "./schema";
export type { RoundedColumnDatum, RoundedColumnGeometryDatum } from "./schema";
export { roundedColumnExample, roundedColumnEdgeCases } from "./example-data";
export { roundedColumnMetadata } from "./metadata";
