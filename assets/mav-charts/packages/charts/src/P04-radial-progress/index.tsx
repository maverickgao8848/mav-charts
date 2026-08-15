import { useState, type KeyboardEvent } from "react";
import { PolarAngleAxis, RadialBar, RadialBarChart, ResponsiveContainer, Tooltip } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { radialProgressExample } from "./example-data";
import { getRadialProgressMotion } from "./motion";
import { buildRadialProgressGeometry, validateRadialProgressData, type RadialProgressDatum, type RadialProgressGeometryDatum } from "./schema";

export type RadialProgressChartProps = {
  data?: readonly RadialProgressDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
};

export const formatRadialProgressLabel = (label: string, maximum = 18) => label.length > maximum ? `${label.slice(0, maximum - 1)}…` : label;
export const formatRadialProgressValue = (value: number) => `${Number(value.toFixed(2))}%`;
export const resolveRadialProgressAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;

const getRadialColors = (theme: VisualSystemTokens) => [theme.primary, theme.secondary, theme.tertiary, theme.fourth] as const;

function RadialProgressTooltip({ active, payload, theme }: { active?: boolean; payload?: readonly { payload?: RadialProgressGeometryDatum }[]; theme: VisualSystemTokens }) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return <div style={{ padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{datum.label}</strong><div>{formatRadialProgressValue(datum.value)} complete</div>{datum.detail ? <small style={{ color: theme.muted }}>{datum.detail}</small> : null}</div>;
}

export function RadialProgressGeometry({ data, theme, animate = true }: { data: readonly RadialProgressDatum[]; theme: VisualSystemTokens; animate?: boolean }) {
  const colors = getRadialColors(theme);
  const geometry = buildRadialProgressGeometry(data).map((datum, index) => ({ ...datum, fill: colors[index % colors.length] }));
  const motion = getRadialProgressMotion(theme.key, animate);
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

  return <div role="group" aria-label="Radial progress interactive chart" data-animation-enabled={animate ? "true" : "false"} tabIndex={0} onFocus={() => setKeyboardIndex((current) => current ?? 0)} onBlur={() => setKeyboardIndex(null)} onKeyDown={handleKeyDown} style={{ position: "relative", width: "100%", height: "100%", outline: "none" }}>
    <div role="list" aria-label="Legend" style={{ position: "absolute", zIndex: 2, top: 2, left: 8, display: "grid", gap: 6, color: theme.muted, fontSize: theme.legend.fontSize }}>
      {geometry.map((datum, index) => <span role="listitem" key={datum.label} title={datum.label} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}><i aria-hidden="true" style={{ width: theme.legend.iconSize, height: theme.legend.iconSize, background: colors[index % colors.length], borderRadius: theme.radius.mark }} />{formatRadialProgressLabel(datum.label)}</span>)}
    </div>
    <div aria-label="Direct percentage labels" style={{ position: "absolute", zIndex: 2, top: 2, right: 8, display: "grid", gap: 6, color: theme.text, fontSize: theme.label.fontSize, fontWeight: theme.label.fontWeight, textAlign: "right" }}>
      {geometry.map((datum) => <span key={datum.label}>{formatRadialProgressValue(datum.value)}</span>)}
    </div>
    <ResponsiveContainer width="100%" height="100%">
      <RadialBarChart data={geometry} cx="50%" cy="57%" innerRadius="24%" outerRadius="88%" barSize={16} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
        <RadialBar dataKey="value" background={{ fill: theme.grid }} cornerRadius={theme.key === "editorial" ? 0 : 8} {...motion} />
        <Tooltip content={({ active: tooltipActive, payload }) => <RadialProgressTooltip active={tooltipActive} payload={payload as unknown as readonly { payload?: RadialProgressGeometryDatum }[]} theme={theme} />} />
      </RadialBarChart>
    </ResponsiveContainer>
    <div aria-hidden="true" style={{ position: "absolute", top: "57%", left: "50%", transform: "translate(-50%, -50%)", display: "grid", textAlign: "center", color: theme.text, pointerEvents: "none" }}><strong style={{ fontFamily: theme.display, fontSize: 30, lineHeight: 1 }}>{formatRadialProgressValue(geometry[0]?.value ?? 0)}</strong><span style={{ marginTop: 6, color: theme.muted, fontSize: theme.label.fontSize }}>LEAD KPI</span></div>
    {active ? <div role="status" style={{ position: "absolute", zIndex: 3, right: 8, bottom: 4, maxWidth: "72%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, borderRadius: theme.tooltip.radius, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {formatRadialProgressValue(active.value)} complete{active.detail ? `; ${active.detail}` : ""}</div> : null}
    <AccessibleDataTable caption="Radial progress percentages" rows={geometry} columns={[{ key: "label", label: "KPI", value: (row) => row.label }, { key: "value", label: "Percent complete", value: (row) => row.value }, { key: "remainder", label: "Percent remaining", value: (row) => row.remainder }, { key: "detail", label: "Detail", value: (row) => row.detail ?? "" }]} />
  </div>;
}

export function RadialProgressChart({ data = radialProgressExample, visualSystem = "digital", animate, title = "Activation leads; expansion still lags", subtitle = "PRODUCT HEALTH · CURRENT COHORT" }: RadialProgressChartProps) {
  const theme = getVisualSystem(visualSystem);
  const reducedMotion = usePrefersReducedMotion();
  const shouldAnimate = resolveRadialProgressAnimation(animate, reducedMotion);
  const validation = validateRadialProgressData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="P04" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · RADIAL PROGRESS`} theme={theme} state={state} description="Concentric KPI completion rings on a fixed zero-to-one-hundred scale."><RadialProgressGeometry data={data} theme={theme} animate={shouldAnimate} /></ChartShell>;
}

export { buildRadialProgressGeometry, validateRadialProgressData } from "./schema";
export type { RadialProgressDatum, RadialProgressGeometryDatum } from "./schema";
export { radialProgressExample, radialProgressEdgeCases } from "./example-data";
export { radialProgressMetadata } from "./metadata";

