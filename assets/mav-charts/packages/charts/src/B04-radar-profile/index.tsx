import { useState, type KeyboardEvent } from "react";
import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  getVisualSystem,
  type VisualSystemId,
  type VisualSystemTokens,
} from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { radarProfileExample } from "./example-data";
import { getRadarProfileMotion } from "./motion";
import {
  buildRadarProfileGeometry,
  validateRadarProfileData,
  type RadarProfileDatum,
  type RadarProfileGeometryDatum,
} from "./schema";
export type RadarProfileChartProps = {
  data?: readonly RadarProfileDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  primaryName?: string;
  comparisonName?: string;
};
export const formatRadarProfileLabel = (label: string, max = 19) =>
  label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
export const formatRadarProfileScore = (value: number) =>
  `${Number(value.toFixed(1))}`;
export const resolveRadarProfileAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
type DotProps = {
  cx?: number;
  cy?: number;
  payload?: RadarProfileGeometryDatum;
  color: string;
  series: "primary" | "comparison";
  animate: boolean;
};
function RadarDot({
  cx = 0,
  cy = 0,
  payload,
  color,
  series,
  animate,
}: DotProps) {
  if (
    !payload ||
    (series === "primary"
      ? payload.value === null
      : payload.comparison === null)
  )
    return <g />;
  return (
    <circle
      data-radar-dot={`${series}:${payload.label}`}
      cx={cx}
      cy={cy}
      r={series === "primary" ? 5 : 4}
      fill={color}
      stroke="none"
    >
      {animate ? (
        <animate
          data-mav-entry={`radar-${series}`}
          attributeName="r"
          from="0"
          to={series === "primary" ? 5 : 4}
          dur="0.65s"
          fill="freeze"
        />
      ) : null}
    </circle>
  );
}
function RadarTooltip({
  active,
  label,
  data,
  theme,
  primaryName,
  comparisonName,
}: {
  active?: boolean;
  label?: string;
  data: readonly RadarProfileDatum[];
  theme: VisualSystemTokens;
  primaryName: string;
  comparisonName: string;
}) {
  const datum = data.find((item) => item.label === label);
  if (!active || !datum) return null;
  return (
    <div
      style={{
        padding: theme.tooltip.padding,
        border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
        background: theme.surfaceAlt,
        color: theme.text,
        fontSize: theme.label.fontSize,
      }}
    >
      <strong>{datum.label}</strong>
      <div>
        {primaryName}:{" "}
        {datum.value === null
          ? "Missing"
          : `${formatRadarProfileScore(datum.value)} / 100`}
      </div>
      <div>
        {comparisonName}:{" "}
        {datum.comparison === null
          ? "Missing"
          : `${formatRadarProfileScore(datum.comparison)} / 100`}
      </div>
      {datum.detail ? (
        <small style={{ color: theme.muted }}>{datum.detail}</small>
      ) : null}
    </div>
  );
}

export function RadarProfileGeometry({
  data,
  theme,
  animate = true,
  primaryName = "Current",
  comparisonName = "Reference",
}: {
  data: readonly RadarProfileDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  primaryName?: string;
  comparisonName?: string;
}) {
  const built = buildRadarProfileGeometry(data),
    [activeIndex, setActiveIndex] = useState<number | null>(null),
    active = activeIndex === null ? null : built.geometry[activeIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !built.geometry.length ||
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    setActiveIndex((current) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? built.geometry.length - 1
          : event.key === "ArrowRight"
            ? ((current ?? 0) + 1) % built.geometry.length
            : ((current ?? 0) - 1 + built.geometry.length) %
              built.geometry.length,
    );
  };
  return (
    <div
      role="group"
      aria-label="Radar profile interactive chart"
      tabIndex={0}
      onFocus={() => setActiveIndex((current) => current ?? 0)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={handleKeyDown}
      data-radar-animation={animate ? "true" : "false"}
      data-domain-min="0"
      data-domain-max="100"
      data-axis-count={built.geometry.length}
      data-primary-complete={built.primaryComplete ? "true" : "false"}
      data-comparison-complete={built.comparisonComplete ? "true" : "false"}
      data-primary-missing={
        built.geometry.filter((datum) => datum.value === null).length
      }
      data-comparison-missing={
        built.geometry.filter((datum) => datum.comparison === null).length
      }
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        outline: "none",
      }}
    >
      <div
        role="list"
        aria-label="Radar profile legend"
        data-radar-legend
        style={{
          position: "absolute",
          zIndex: 4,
          top: 3,
          right: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span role="listitem">
          <b style={{ color: theme.primary }}>●</b> {primaryName} · normalized
        </span>
        <span role="listitem">
          <b style={{ color: theme.secondary }}>●</b> {comparisonName} ·
          normalized
        </span>
        <span role="listitem">Shared domain 0..100</span>
        <span role="listitem">Missing ≠ zero</span>
      </div>
      <div
        data-radar-direct-label
        style={{
          position: "absolute",
          zIndex: 4,
          top: 40,
          right: 8,
          textAlign: "right",
          color: theme.text,
          fontSize: theme.label.fontSize,
          fontWeight: theme.label.fontWeight,
        }}
      >
        {built.primaryPeak ? (
          <div style={{ color: theme.primary }}>
            {primaryName} peak ·{" "}
            {formatRadarProfileLabel(built.primaryPeak.label)}{" "}
            {formatRadarProfileScore(built.primaryPeak.value!)}
          </div>
        ) : (
          <div>{primaryName} unavailable</div>
        )}
        {built.comparisonPeak ? (
          <div style={{ color: theme.secondary }}>
            {comparisonName} peak ·{" "}
            {formatRadarProfileLabel(built.comparisonPeak.label)}{" "}
            {formatRadarProfileScore(built.comparisonPeak.comparison!)}
          </div>
        ) : (
          <div>{comparisonName} unavailable</div>
        )}
      </div>
      {built.geometry.length >= 3 ? (
        <div
          data-radar-plot
          style={{ position: "absolute", inset: "76px 0 0" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart
              data={built.geometry}
              outerRadius="72%"
              accessibilityLayer
            >
              <PolarGrid stroke={theme.grid} radialLines />
              <PolarAngleAxis
                dataKey="label"
                tickFormatter={(label) =>
                  formatRadarProfileLabel(String(label), 15)
                }
                tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
              />
              <PolarRadiusAxis
                domain={[0, 100]}
                ticks={[25, 50, 75, 100]}
                tick={{ fill: theme.muted, fontSize: theme.label.fontSize - 1 }}
                axisLine={false}
              />
              <Tooltip
                content={({ active, label }) => (
                  <RadarTooltip
                    active={active}
                    label={String(label ?? "")}
                    data={data}
                    theme={theme}
                    primaryName={primaryName}
                    comparisonName={comparisonName}
                  />
                )}
              />
              {built.comparisonComplete ? (
                <Radar
                  name={comparisonName}
                  dataKey="comparison"
                  stroke={theme.secondary}
                  fill={theme.secondary}
                  fillOpacity={0.12}
                  strokeWidth={theme.line.data + 1}
                  dot={(props: unknown) => (
                    <RadarDot
                      {...(props as Omit<
                        DotProps,
                        "color" | "series" | "animate"
                      >)}
                      color={theme.secondary}
                      series="comparison"
                      animate={animate}
                    />
                  )}
                  connectNulls={false}
                  {...getRadarProfileMotion(theme.key, animate, 90)}
                />
              ) : null}
              {built.primaryComplete ? (
                <Radar
                  name={primaryName}
                  dataKey="value"
                  stroke={theme.primary}
                  fill={theme.primary}
                  fillOpacity={0.24}
                  strokeWidth={theme.line.emphasis}
                  dot={(props: unknown) => (
                    <RadarDot
                      {...(props as Omit<
                        DotProps,
                        "color" | "series" | "animate"
                      >)}
                      color={theme.primary}
                      series="primary"
                      animate={animate}
                    />
                  )}
                  connectNulls={false}
                  {...getRadarProfileMotion(theme.key, animate)}
                />
              ) : null}
            </RadarChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          data-radar-unavailable
          style={{
            display: "grid",
            placeItems: "center",
            width: "100%",
            height: "100%",
            color: theme.muted,
            fontSize: theme.label.fontSize,
          }}
        >
          PROFILE UNAVAILABLE · NEED AT LEAST 3 COMMON AXES
        </div>
      )}
      {active ? (
        <div
          role="status"
          style={{
            position: "absolute",
            zIndex: 5,
            right: 8,
            bottom: 4,
            maxWidth: "82%",
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.label}: {primaryName}{" "}
          {active.value === null
            ? "Missing"
            : `${formatRadarProfileScore(active.value)} / 100`}
          ; {comparisonName}{" "}
          {active.comparison === null
            ? "Missing"
            : `${formatRadarProfileScore(active.comparison)} / 100`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Normalized radar profile scores"
        rows={built.geometry}
        columns={[
          { key: "label", label: "Dimension", value: (datum) => datum.label },
          {
            key: "primary",
            label: `${primaryName} normalized score`,
            value: (datum) =>
              datum.value === null
                ? "Missing"
                : `${formatRadarProfileScore(datum.value)} / 100`,
          },
          {
            key: "comparison",
            label: `${comparisonName} normalized score`,
            value: (datum) =>
              datum.comparison === null
                ? "Missing"
                : `${formatRadarProfileScore(datum.comparison)} / 100`,
          },
          {
            key: "detail",
            label: "Normalization note",
            value: (datum) =>
              datum.detail ?? "Caller-provided normalized score",
          },
        ]}
      />
    </div>
  );
}
export function RadarProfileChart({
  data = radarProfileExample,
  visualSystem = "signal",
  animate,
  title = "Technology leads the current capability profile",
  subtitle = "NORMALIZED SCORE · FIXED 0–100 DOMAIN · SAME AXES",
  primaryName = "Current",
  comparisonName = "Reference",
}: RadarProfileChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateRadarProfileData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="B04"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · RADAR PROFILE`}
      theme={theme}
      state={state}
      description="Two caller-normalized profiles on one fixed 0..100 radial scale; missing scores are never zero."
    >
      <RadarProfileGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveRadarProfileAnimation(
          animate,
          usePrefersReducedMotion(),
        )}
        primaryName={primaryName}
        comparisonName={comparisonName}
      />
    </ChartShell>
  );
}
export {
  buildRadarProfileGeometry,
  mapRadarPoint,
  mapRadarRadius,
  validateRadarProfileData,
} from "./schema";
export type { RadarProfileDatum, RadarProfileGeometryDatum } from "./schema";
export { radarProfileExample, radarProfileEdgeCases } from "./example-data";
export { radarProfileMetadata } from "./metadata";
