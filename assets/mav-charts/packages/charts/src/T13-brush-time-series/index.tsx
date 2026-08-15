import { useEffect, useId, useMemo, useRef, useState, type FocusEvent, type KeyboardEvent } from "react";
import { Area, AreaChart, Brush, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { brushTimeSeriesExample } from "./example-data";
import { getBrushTimeSeriesMotion } from "./motion";
import { buildBrushTimeSeriesGeometry, getBrushTimeSeriesDomain, validateBrushTimeSeriesData, type BrushTimeSeriesDatum, type BrushTimeSeriesGeometryDatum } from "./schema";

export type BrushTimeSeriesChartProps = {
  data?: readonly BrushTimeSeriesDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
};

export const formatBrushTimeSeriesLabel = (label: string, maximum = 11) => label.length > maximum ? `${label.slice(0, maximum - 1)}…` : label;
export const resolveBrushTimeSeriesAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;
export const formatBrushTimeSeriesValue = (value: number) => {
  const absolute = Math.abs(value);
  const compact = (divisor: number, suffix: string) => `${Number((value / divisor).toFixed(1))}${suffix}`;
  if (absolute >= 1_000_000_000) return compact(1_000_000_000, "B");
  if (absolute >= 1_000_000) return compact(1_000_000, "M");
  if (absolute >= 1_000) return compact(1_000, "K");
  return String(value);
};

function BrushTimeSeriesTooltip({ active, payload, theme }: { active?: boolean; payload?: readonly { payload?: BrushTimeSeriesGeometryDatum }[]; theme: VisualSystemTokens }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>Value {datum.value}</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function BrushTimeSeriesGeometry({ data, theme, animate = true }: { data: readonly BrushTimeSeriesDatum[]; theme: VisualSystemTokens; animate?: boolean }) {
  const gradientId = `brush-series-${useId().replace(/:/g, "")}`;
  const geometry = useMemo(() => buildBrushTimeSeriesGeometry(data), [data]);
  const domain = useMemo(() => getBrushTimeSeriesDomain(data), [data]);
  const motion = getBrushTimeSeriesMotion(theme.key, animate);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const [brushRange, setBrushRange] = useState(() => ({ startIndex: 0, endIndex: Math.max(0, geometry.length - 1) }));
  const interactiveRef = useRef<HTMLDivElement>(null);
  const active = keyboardIndex === null ? null : geometry[keyboardIndex];
  const latest = geometry.at(-1);
  const rangeStart = geometry[Math.min(brushRange.startIndex, Math.max(0, geometry.length - 1))];
  const rangeEnd = geometry[Math.min(brushRange.endIndex, Math.max(0, geometry.length - 1))];
  const rangeLabel = `Selected time range from ${rangeStart?.label ?? "unavailable"} to ${rangeEnd?.label ?? "unavailable"}`;

  useEffect(() => {
    const boundaries = [
      { index: brushRange.startIndex, label: rangeStart?.label ?? "unavailable", edge: "Start" },
      { index: brushRange.endIndex, label: rangeEnd?.label ?? "unavailable", edge: "End" },
    ];
    const applyTravellerSemantics = () => {
      const travellers = interactiveRef.current?.querySelectorAll<SVGGElement>(".recharts-brush-traveller");
      travellers?.forEach((traveller, index) => {
        const boundary = boundaries[index];
        if (!boundary) return;
        traveller.setAttribute("aria-label", `${boundary.edge} of selected time range: ${boundary.label}`);
        traveller.setAttribute("aria-valuemin", "0");
        traveller.setAttribute("aria-valuemax", String(Math.max(0, geometry.length - 1)));
        traveller.setAttribute("aria-valuenow", String(boundary.index));
        traveller.setAttribute("aria-valuetext", boundary.label);
      });
    };
    applyTravellerSemantics();
    const observer = new MutationObserver(applyTravellerSemantics);
    if (interactiveRef.current) observer.observe(interactiveRef.current, { childList: true, subtree: true });
    return () => observer.disconnect();
  }, [brushRange, geometry.length, rangeEnd?.label, rangeStart?.label]);

  const handleBrushChange = (next: { startIndex?: number; endIndex?: number }) => {
    if (typeof next.startIndex !== "number" || typeof next.endIndex !== "number") return;
    setBrushRange((current) => current.startIndex === next.startIndex && current.endIndex === next.endIndex ? current : { startIndex: next.startIndex!, endIndex: next.endIndex! });
  };

  const handleFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setKeyboardIndex((current) => current ?? 0);
  };

  const handleBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) setKeyboardIndex(null);
  };
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

  return <div ref={interactiveRef} role="group" aria-label="Brush and zoom time series interactive chart" data-animation-enabled={animate ? "true" : "false"} tabIndex={0} onFocus={handleFocus} onBlur={handleBlur} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Legend" style={{ position: "absolute", zIndex: 2, top: 1, left: 8, display: "flex", alignItems: "center", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}><span role="listitem" style={{ display: "inline-flex", alignItems: "center", gap: 5 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize + 7, height: 2, background: theme.primary }} />Requests / min</span></div>
    {latest ? <div aria-label={`Latest value ${latest.value}`} style={{ position: "absolute", zIndex: 2, top: 0, right: 8, color: theme.text, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }}>LATEST · {formatBrushTimeSeriesValue(latest.value)}</div> : null}
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={geometry} margin={{ top: 30, right: 12, left: -8, bottom: 2 }} accessibilityLayer>
        <defs><linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={theme.secondary} stopOpacity="0.46" /><stop offset="100%" stopColor={theme.secondary} stopOpacity="0.04" /></linearGradient></defs>
        <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
        <XAxis dataKey="label" minTickGap={26} tickFormatter={(label) => formatBrushTimeSeriesLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} />
        <YAxis domain={[...domain]} tickFormatter={(value) => formatBrushTimeSeriesValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} />
        <Tooltip content={({ active: tooltipActive, payload }) => <BrushTimeSeriesTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: BrushTimeSeriesGeometryDatum }[]} theme={theme} />} />
        <Area type="monotone" dataKey="value" stroke={theme.primary} fill={`url(#${gradientId})`} strokeWidth={theme.line.emphasis} dot={false} activeDot={{ fill: theme.tertiary, r: 4, strokeWidth: 0 }} {...motion} />
        <Brush dataKey="label" height={27} stroke={theme.primary} fill={theme.surfaceAlt} travellerWidth={8} tickFormatter={(label) => formatBrushTimeSeriesLabel(String(label), 7)} startIndex={brushRange.startIndex} endIndex={brushRange.endIndex} onChange={handleBrushChange} ariaLabel={rangeLabel} />
      </AreaChart>
    </ResponsiveContainer>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, top: 22, right: 8, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {active.value}{active.detail ? `; ${active.detail}` : ""}</div> : null}
    <div className="sr-only" aria-live="polite">{rangeLabel}</div>
    <AccessibleDataTable caption="Time series values" rows={geometry} columns={[{ key: "label", label: "Time", value: (row) => row.label }, { key: "value", label: "Value", value: (row) => row.value }, { key: "detail", label: "Detail", value: (row) => row.detail ?? "" }]} />
  </div>;
}

export function BrushTimeSeriesChart({ data = brushTimeSeriesExample, visualSystem = "digital", animate, title = "Traffic accelerated without a latency tax", subtitle = "REQUESTS / MIN · LIVE 24H WINDOW" }: BrushTimeSeriesChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveBrushTimeSeriesAnimation(animate, reducedMotion);
  const validation = validateBrushTimeSeriesData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="T13" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · BRUSH TIME SERIES`} theme={theme} state={state} description="A long time series with a draggable focus window."><BrushTimeSeriesGeometry data={data} theme={theme} animate={shouldAnimate} /></ChartShell>;
}

export { buildBrushTimeSeriesGeometry, getBrushTimeSeriesDomain, validateBrushTimeSeriesData } from "./schema";
export type { BrushTimeSeriesDatum, BrushTimeSeriesGeometryDatum } from "./schema";
export { brushTimeSeriesExample, brushTimeSeriesEdgeCases } from "./example-data";
export { brushTimeSeriesMetadata } from "./metadata";
