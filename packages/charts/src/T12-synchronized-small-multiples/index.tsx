import { useState, type KeyboardEvent } from "react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { synchronizedSmallMultiplesExample } from "./example-data";
import { getSynchronizedSmallMultiplesMotion } from "./motion";
import { buildSynchronizedGeometry, validateSynchronizedPanels, type SynchronizedGeometryPoint, type SynchronizedPanel } from "./schema";

const SYNC_ID = "t12-synchronized-small-multiples";
export type SynchronizedSmallMultiplesChartProps = { data?: readonly SynchronizedPanel[]; visualSystem?: VisualSystemId; animate?: boolean; title?: string; subtitle?: string };
export const formatSynchronizedLabel = (label: string, maximum = 10) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const formatSynchronizedValue = (value: number) => { const absolute = Math.abs(value); if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`; if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`; if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`; return Number(value.toFixed(4)).toString(); };
export const resolveSynchronizedAnimation = (animate: boolean | undefined, reduced: boolean) => animate ?? !reduced;

function SyncDot({ cx = 0, cy = 0, payload, color, animate, panelId, unit, theme }: { cx?: number; cy?: number; payload?: SynchronizedGeometryPoint; color: string; animate: boolean; panelId: string; unit: string; theme: VisualSystemTokens }) {
  if (!payload || payload.value === null) return null;
  return <g>
    <circle data-sync-dot={`${panelId}:${payload.index}`} data-panel={panelId} data-index={payload.index} cx={cx} cy={cy} r={payload.latestValid ? 3.7 : 2.7} fill={color} stroke={theme.background} strokeWidth={1.2}>
      {animate ? <animate data-mav-entry="synchronized-small-multiples" attributeName="r" from="0" to={payload.latestValid ? "3.7" : "2.7"} dur="0.68s" fill="freeze" /> : null}
    </circle>
    {payload.latestValid ? <text data-sync-latest={panelId} x={cx} y={cy - 9} textAnchor="middle" fill={color} fontSize={theme.label.fontSize} fontWeight={theme.label.fontWeight}>LATEST {formatSynchronizedValue(payload.value)} {unit}</text> : null}
  </g>;
}

function PanelTooltip({ active, payload, panel, theme }: { active?: boolean; payload?: readonly { payload?: SynchronizedGeometryPoint }[]; panel: { title: string; unit: string }; theme: VisualSystemTokens }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div data-sync-tooltip style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{panel.title}: {datum.value === null ? "Missing" : `${formatSynchronizedValue(datum.value)} ${panel.unit}`}</div></div>;
}

export function SynchronizedSmallMultiplesGeometry({ data, theme, animate = true }: { data: readonly SynchronizedPanel[]; theme: VisualSystemTokens; animate?: boolean }) {
  const geometry = buildSynchronizedGeometry(data);
  const labels = geometry[0]?.data.map(({ label }) => label) ?? [];
  const [keyboardIndex, setKeyboardIndex] = useState<number | null>(null);
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!labels.length || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setKeyboardIndex((current) => event.key === "Home" ? 0 : event.key === "End" ? labels.length - 1 : event.key === "ArrowRight" ? ((current ?? 0) + 1) % labels.length : ((current ?? 0) - 1 + labels.length) % labels.length);
  };
  const tableRows = labels.map((label, index) => ({ label, values: geometry.map((panel) => panel.data[index]?.value ?? null) }));
  return <div role="group" aria-label="Synchronized small multiples interactive chart" tabIndex={0} data-sync-id={SYNC_ID} data-sync-animation={animate ? "true" : "false"} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none", display: "grid", gridTemplateRows: "auto minmax(0, 1fr)" }}>
    <div role="list" aria-label="Synchronized small multiples legend" data-sync-legend style={{ position: "relative", zIndex: 5, justifySelf: "end", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: theme.legend.gap, padding: "0 8px 5px", color: theme.muted, fontSize: theme.legend.fontSize }}>
      <span role="listitem" style={{ color: theme.primary }}>━ First panel emphasis</span><span role="listitem" style={{ color: theme.secondary }}>━ Context panels</span><span role="listitem">Independent units/scales · synchronized observation</span><span role="listitem">Missing = panel-local break</span>
    </div>
    <div data-sync-panel-stack style={{ position: "relative", minHeight: 0, display: "grid", gridTemplateRows: `repeat(${Math.max(geometry.length, 1)}, minmax(0, 1fr))`, gap: 2 }}>
      {geometry.map((panel, panelIndex) => {
        const color = panelIndex === 0 ? theme.primary : theme.secondary;
        return <section key={panel.id} data-sync-panel={panel.id} data-sync-domain={`${panel.domain[0]},${panel.domain[1]}`} style={{ position: "relative", minHeight: 0, borderTop: `1px solid ${theme.grid}` }}>
          <div data-sync-panel-heading style={{ position: "absolute", zIndex: 2, top: 3, left: 8, display: "flex", gap: 7, alignItems: "baseline", color }}><strong style={{ fontSize: theme.label.fontSize + 1 }}>{panel.title}</strong><span style={{ color: theme.muted, fontSize: theme.label.fontSize }}>{panel.unit} · OWN SCALE</span></div>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={[...panel.data]} syncId={SYNC_ID} syncMethod="index" margin={{ top: 25, right: 38, left: 2, bottom: panelIndex === geometry.length - 1 ? 8 : 0 }} accessibilityLayer>
              <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
              <XAxis dataKey="label" interval={0} hide={panelIndex !== geometry.length - 1} tickFormatter={(label) => formatSynchronizedLabel(String(label))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} />
              <YAxis domain={[...panel.domain]} tickFormatter={(value) => formatSynchronizedValue(Number(value))} tick={{ fill: theme.muted, fontSize: theme.label.fontSize }} axisLine={false} tickLine={false} width={56} />
              <Tooltip cursor={{ stroke: color, strokeWidth: 1 }} content={({ active, payload }) => <PanelTooltip active={active} payload={payload as unknown as readonly { payload?: SynchronizedGeometryPoint }[]} panel={panel} theme={theme} />} />
              <Line type="linear" dataKey="value" connectNulls={false} stroke={color} strokeWidth={panelIndex === 0 ? theme.line.emphasis : theme.line.data} dot={(props: unknown) => <SyncDot {...(props as { cx?: number; cy?: number; payload?: SynchronizedGeometryPoint })} color={color} animate={animate} panelId={panel.id} unit={panel.unit} theme={theme} />} activeDot={{ r: 5, fill: color, stroke: theme.background }} {...getSynchronizedSmallMultiplesMotion(theme.key, animate, panelIndex)} />
            </LineChart>
          </ResponsiveContainer>
        </section>;
      })}
    </div>
    {keyboardIndex !== null ? <div role="status" style={{ position: "absolute", zIndex: 8, right: 8, bottom: 4, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{labels[keyboardIndex]}: {geometry.map((panel) => `${panel.title} ${panel.data[keyboardIndex]?.value === null ? "Missing" : `${formatSynchronizedValue(panel.data[keyboardIndex].value!)} ${panel.unit}`}`).join("; ")}</div> : null}
    <AccessibleDataTable caption="Synchronized small multiples values" rows={tableRows} columns={[{ key: "label", label: "Observation", value: (row) => row.label }, ...geometry.map((panel, panelIndex) => ({ key: panel.id, label: `${panel.title} (${panel.unit})`, value: (row: { label: string; values: readonly (number | null)[] }) => row.values[panelIndex] ?? "Missing" }))]} />
  </div>;
}

export function SynchronizedSmallMultiplesChart({ data = synchronizedSmallMultiplesExample, visualSystem = "signal", animate, title = "Growth strengthened before sentiment followed", subtitle = "THREE METRICS · INDEPENDENT SCALES · ONE SHARED OBSERVATION" }: SynchronizedSmallMultiplesChartProps) {
  const theme = getVisualSystem(visualSystem), validation = validateSynchronizedPanels(data), state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="T12" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · SYNCHRONIZED SMALL MULTIPLES`} theme={theme} state={state} description="Two to four aligned panels share ordered observations while retaining independent units and domains."><SynchronizedSmallMultiplesGeometry data={validation.valid ? data : []} theme={theme} animate={resolveSynchronizedAnimation(animate, usePrefersReducedMotion())} /></ChartShell>;
}

export { buildSynchronizedGeometry, getSynchronizedPanelDomain, mapSynchronizedX, validateSynchronizedPanels } from "./schema";
export type { SynchronizedPoint, SynchronizedPanel, SynchronizedGeometryPoint, SynchronizedGeometryPanel } from "./schema";
export { synchronizedSmallMultiplesExample, synchronizedSmallMultiplesEdgeCases } from "./example-data";
export { synchronizedSmallMultiplesMetadata } from "./metadata";
