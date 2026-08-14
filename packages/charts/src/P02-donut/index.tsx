import { useState, type KeyboardEvent } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import {
  getVisualSystem,
  type VisualSystemId,
  type VisualSystemTokens,
} from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { donutExample } from "./example-data";
import { getDonutMotion } from "./motion";
import {
  buildDonutGeometry,
  validateDonutData,
  type DonutDatum,
  type DonutGeometryDatum,
} from "./schema";

export type DonutChartProps = {
  data?: readonly DonutDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  unit?: string;
};
export const formatDonutValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const formatDonutLabel = (label: string, maximum = 18) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const resolveDonutAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;

function DonutTooltip({
  active,
  payload,
  theme,
  unit,
}: {
  active?: boolean;
  payload?: readonly { payload?: DonutGeometryDatum }[];
  theme: VisualSystemTokens;
  unit: string;
}) {
  const datum = payload?.[0]?.payload;
  if (!active || !datum) return null;
  return (
    <div
      role="tooltip"
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
        {datum.missing
          ? "Missing"
          : datum.zero
            ? `Zero · 0${unit}`
            : `${formatDonutValue(datum.value!)}${unit} · ${(datum.share! * 100).toFixed(1)}%`}
      </div>
      {datum.detail ? (
        <small style={{ color: theme.muted }}>{datum.detail}</small>
      ) : null}
    </div>
  );
}

export function DonutGeometry({
  data,
  theme,
  animate = true,
  unit = "",
}: {
  data: readonly DonutDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  unit?: string;
}) {
  const built = buildDonutGeometry(data),
    motion = getDonutMotion(theme.key, animate),
    [hovered, setHovered] = useState<number | null>(null),
    [keyboard, setKeyboard] = useState<number | null>(null),
    active = keyboard === null ? null : built.geometry[keyboard],
    selected = hovered === null ? active : (built.renderable[hovered] ?? null);
  const colors =
    theme.key === "signal"
      ? [theme.primary, theme.secondary, theme.fourth, theme.tertiary]
      : [theme.primary, theme.secondary, theme.tertiary, theme.fourth];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !built.geometry.length ||
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    setKeyboard((current) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? built.geometry.length - 1
          : event.key === "ArrowRight"
            ? ((current ?? -1) + 1) % built.geometry.length
            : ((current ?? 0) - 1 + built.geometry.length) %
              built.geometry.length,
    );
  };
  return (
    <div
      role="group"
      aria-label="Donut interactive chart"
      tabIndex={0}
      onFocus={() => setKeyboard((value) => value ?? 0)}
      onBlur={() => setKeyboard(null)}
      onKeyDown={onKeyDown}
      data-donut-animation={animate ? "true" : "false"}
      data-total={built.total}
      data-slice-count={built.renderable.length}
      data-missing-count={
        built.geometry.filter((datum) => datum.missing).length
      }
      data-zero-count={built.geometry.filter((datum) => datum.zero).length}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        outline: "none",
      }}
    >
      <div
        role="list"
        aria-label="Donut legend"
        data-donut-legend
        style={{
          position: "absolute",
          zIndex: 3,
          top: 4,
          right: 8,
          maxWidth: "58%",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "flex-end",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        {built.geometry.map((datum, index) => (
          <span
            role="listitem"
            key={datum.label}
            title={datum.label}
            style={{ color: theme.muted }}
          >
            <span
              aria-hidden="true"
              style={{
                color: datum.renderable
                  ? colors[index % colors.length]
                  : theme.muted,
              }}
            >
              ■
            </span>{" "}
            {formatDonutLabel(datum.label, 15)} ·{" "}
            {datum.missing
              ? "Missing"
              : datum.zero
                ? "Zero"
                : `${(datum.share! * 100).toFixed(1)}%`}
          </span>
        ))}
      </div>
      {built.total > 0 ? (
        <div
          data-donut-plot
          style={{ position: "absolute", inset: "48px 0 0" }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <PieChart accessibilityLayer>
              <Pie
                data={built.renderable}
                dataKey="value"
                nameKey="label"
                cx="50%"
                cy="55%"
                innerRadius="43%"
                outerRadius="76%"
                paddingAngle={0}
                stroke={theme.background}
                strokeWidth={theme.key === "signal" ? 3 : 2}
                onMouseEnter={(_, index) => setHovered(index)}
                onMouseLeave={() => setHovered(null)}
                {...motion}
              >
                {built.renderable.map((datum, index) => (
                  <Cell
                    key={datum.label}
                    data-donut-slice={datum.label}
                    data-share={datum.share}
                    data-angle={datum.share! * 360}
                    data-focus={datum.focus ? "true" : "false"}
                    fill={colors[datum.index % colors.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                content={({ active: tooltipActive, payload }) => (
                  <DonutTooltip
                    active={tooltipActive}
                    payload={
                      payload as unknown as readonly {
                        payload?: DonutGeometryDatum;
                      }[]
                    }
                    theme={theme}
                    unit={unit}
                  />
                )}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          data-donut-no-area
          style={{
            display: "grid",
            placeItems: "center",
            width: "100%",
            height: "100%",
            color: theme.muted,
            fontSize: theme.label.fontSize,
          }}
        >
          NO POSITIVE TOTAL · ZERO AND MISSING REMAIN IN TABLE
        </div>
      )}
      <div
        data-donut-center
        style={{
          position: "absolute",
          zIndex: 2,
          left: "50%",
          top: "57%",
          transform: "translate(-50%,-50%)",
          maxWidth: 132,
          textAlign: "center",
          color: selected?.renderable
            ? colors[selected.index % colors.length]
            : theme.text,
          pointerEvents: "none",
        }}
      >
        <strong
          style={{
            display: "block",
            fontFamily: theme.display,
            fontSize: 30,
            lineHeight: 1,
          }}
        >
          {formatDonutValue(
            selected?.renderable ? selected.value! : built.total,
          )}
          {unit}
        </strong>
        <span style={{ color: theme.muted, fontSize: theme.label.fontSize }}>
          {selected?.renderable
            ? `${formatDonutLabel(selected.label, 14)} · ${(selected.share! * 100).toFixed(1)}%`
            : "REPORTED TOTAL"}
        </span>
      </div>
      {active ? (
        <div
          role="status"
          style={{
            position: "absolute",
            zIndex: 4,
            right: 8,
            bottom: 4,
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.label}:{" "}
          {active.missing
            ? "Missing"
            : active.zero
              ? `Zero; 0${unit}`
              : `${formatDonutValue(active.value!)}${unit}; ${(active.share! * 100).toFixed(1)}% of reported total`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Donut composition"
        rows={built.geometry}
        columns={[
          { key: "label", label: "Category", value: (datum) => datum.label },
          {
            key: "value",
            label: `Value${unit ? ` (${unit})` : ""}`,
            value: (datum) => (datum.missing ? "Missing" : datum.value!),
          },
          {
            key: "share",
            label: "Share of positive reported total",
            value: (datum) =>
              datum.share === null
                ? datum.zero
                  ? "0%"
                  : "Missing"
                : `${(datum.share * 100).toFixed(1)}%`,
          },
          {
            key: "detail",
            label: "Detail",
            value: (datum) => datum.detail ?? "",
          },
        ]}
      />
    </div>
  );
}

export function DonutChart({
  data = donutExample,
  visualSystem = "signal",
  animate,
  title = "Enterprise represents nearly three quarters of the reported mix",
  subtitle = "DONUT · ANGLE ENCODES SHARE · CENTER = REPORTED TOTAL",
  unit = "",
}: DonutChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateDonutData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="P02"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · DONUT`}
      theme={theme}
      state={state}
      description="A few non-negative categories encoded by angle around one positive reported total; missing and zero receive no angle."
    >
      <DonutGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveDonutAnimation(animate, usePrefersReducedMotion())}
        unit={unit}
      />
    </ChartShell>
  );
}

export { buildDonutGeometry, getDonutAngle, validateDonutData } from "./schema";
export type { DonutDatum, DonutGeometryDatum } from "./schema";
export { donutExample, donutEdgeCases } from "./example-data";
export { donutMetadata } from "./metadata";
