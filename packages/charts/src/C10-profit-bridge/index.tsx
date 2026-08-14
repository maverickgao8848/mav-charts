import { useId, useState, type KeyboardEvent } from "react";
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { profitBridgeExample } from "./example-data";
import { getProfitBridgeMotion } from "./motion";
import { buildProfitBridgeGeometry, validateProfitBridgeData, type ProfitBridgeDatum, type ProfitBridgeGeometryDatum } from "./schema";

export type ProfitBridgeChartProps = {
  data?: readonly ProfitBridgeDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
};

function formatSigned(value: number) {
  return value > 0 ? `+${value}` : String(value);
}

export function formatProfitBridgeLabel(label: string, maximum = 12) {
  return label.length > maximum ? `${label.slice(0, maximum - 1)}…` : label;
}

export function resolveChartAnimation(animate: boolean | undefined, reducedMotion: boolean) {
  return animate ?? !reducedMotion;
}

function ProfitBridgeTooltip({ active, payload, theme }: { active?: boolean; payload?: readonly { payload?: ProfitBridgeGeometryDatum }[]; theme: VisualSystemTokens }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;

  return (
    <div style={{ background: theme.surfaceAlt, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, color: theme.text, padding: theme.tooltip.padding }}>
      <strong>{datum.label}</strong>
      <div>{datum.kind === "change" ? formatSigned(datum.value) : datum.value}</div>
      {datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}
    </div>
  );
}

export function ProfitBridgeGeometry({ data, theme, animate = true }: { data: readonly ProfitBridgeDatum[]; theme: VisualSystemTokens; animate?: boolean }) {
  const gradientId = `profit-bridge-${useId().replace(/:/g, "")}`;
  const geometry = buildProfitBridgeGeometry(data);
  const chartData = geometry.map((datum) => ({
    ...datum,
    valueLabel: datum.direction === "total" ? String(datum.value) : formatSigned(datum.value),
  }));
  const values = geometry.flatMap(({ range }) => range);
  const minimum = Math.min(0, ...values);
  const maximum = Math.max(0, ...values);
  const padding = Math.max(1, (maximum - minimum) * 0.12);
  const domain: readonly [number, number] = [
    minimum < 0 ? Math.floor((minimum - padding) / 10) * 10 : 0,
    Math.ceil((maximum + padding) / 10) * 10,
  ];
  const motion = getProfitBridgeMotion(theme.key, animate);
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const keyboardDatum = keyboardIndex === null ? null : geometry[keyboardIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return;
    event.preventDefault();
    setKeyboardIndex((current) => {
      if (event.key === "Home") return 0;
      if (event.key === "End") return geometry.length - 1;
      const start = current ?? 0;
      return event.key === "ArrowRight" ? (start + 1) % geometry.length : (start - 1 + geometry.length) % geometry.length;
    });
  };

  return (
    <div role="group" aria-label="Profit bridge interactive chart" data-animation-enabled={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
      <div role="list" aria-label="Legend" style={{ position: "absolute", zIndex: 2, top: 2, right: 8, display: "flex", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
        {[["Total", theme.text], ["Increase", theme.primary], ["Decrease", theme.fourth]].map(([label, color]) => <span role="listitem" key={label} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize, height: theme.legend.iconSize, background: color as string }} />{label}</span>)}
      </div>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 32, right: 12, left: -10, bottom: 8 }} accessibilityLayer>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={theme.primary} />
              <stop offset="100%" stopColor={theme.fourth} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
          <XAxis dataKey="label" tickFormatter={(label) => formatProfitBridgeLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight }} axisLine={false} tickLine={false} interval={0} />
          <YAxis domain={[...domain]} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} />
          <Tooltip content={({ active, payload }) => <ProfitBridgeTooltip active={active} payload={payload as unknown as readonly { payload?: ProfitBridgeGeometryDatum }[]} theme={theme} />} cursor={{ fill: theme.grid, opacity: 0.22 }} />
          <Bar dataKey="range" {...motion} radius={[theme.radius.mark, theme.radius.mark, 0, 0]}>
            {geometry.map((datum) => (
              <Cell key={datum.label} fill={datum.direction === "total" ? theme.text : datum.direction === "up" ? theme.primary : `url(#${gradientId})`} />
            ))}
            <LabelList dataKey="valueLabel" position="top" fill={theme.text} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      {keyboardDatum ? <div role="status" style={{ position: "absolute", zIndex: 3, top: 24, right: 8, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{keyboardDatum.label}: {keyboardDatum.direction === "total" ? keyboardDatum.value : formatSigned(keyboardDatum.value)}; running total {keyboardDatum.runningTotal}</div> : null}
      <AccessibleDataTable
        caption="Profit bridge values"
        rows={geometry}
        columns={[
          { key: "label", label: "Factor", value: (row) => row.label },
          { key: "value", label: "Change", value: (row) => row.value },
          { key: "total", label: "Running total", value: (row) => row.runningTotal },
        ]}
      />
    </div>
  );
}

export function ProfitBridgeChart({ data = profitBridgeExample, visualSystem = "signal", animate, title = "Margin recovery did the heavy lifting", subtitle = "EBITDA BRIDGE · INDEXED TO 100" }: ProfitBridgeChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveChartAnimation(animate, reducedMotion);
  const validation = validateProfitBridgeData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";

  return (
    <ChartShell code="C10" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · PROFIT BRIDGE`} theme={theme} state={state} description="Opening value, signed drivers and closing value.">
      <ProfitBridgeGeometry data={data} theme={theme} animate={shouldAnimate} />
    </ChartShell>
  );
}

export { buildProfitBridgeGeometry, validateProfitBridgeData } from "./schema";
export type { ProfitBridgeDatum, ProfitBridgeGeometryDatum, ProfitBridgeKind } from "./schema";
export { profitBridgeExample, profitBridgeEdgeCases } from "./example-data";
export { profitBridgeMetadata } from "./metadata";
