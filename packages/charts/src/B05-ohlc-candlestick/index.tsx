import { useState, type KeyboardEvent } from "react";
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  getVisualSystem,
  type VisualSystemId,
  type VisualSystemTokens,
} from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { ohlcExample } from "./example-data";
import { getOhlcMotion } from "./motion";
import {
  buildOhlcGeometry,
  getCandleBodyWidth,
  getOhlcDomain,
  mapOhlcY,
  validateOhlcData,
  type OhlcDatum,
  type OhlcGeometryDatum,
} from "./schema";
export type OhlcCandlestickChartProps = {
  data?: readonly OhlcDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  unit?: string;
};
export const formatOhlcValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(4)).toString();
};
export const formatOhlcLabel = (label: string, max = 14) =>
  label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
export const resolveOhlcAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
type ParentViewBox = { x: number; y: number; width: number; height: number };
type CandleProps = {
  x?: number;
  width?: number;
  payload?: OhlcGeometryDatum & { animate?: boolean };
  parentViewBox?: ParentViewBox;
  domain: readonly [number, number];
  theme: VisualSystemTokens;
};
function CandleShape({
  x = 0,
  width = 0,
  payload,
  parentViewBox,
  domain,
  theme,
}: CandleProps) {
  if (!payload || payload.missing || !parentViewBox) return <g />;
  const center = x + width / 2,
    range = [parentViewBox.y + parentViewBox.height, parentViewBox.y] as const,
    highY = mapOhlcY(payload.high!, domain, range),
    lowY = mapOhlcY(payload.low!, domain, range),
    openY = mapOhlcY(payload.open!, domain, range),
    closeY = mapOhlcY(payload.close!, domain, range),
    bodyWidth = getCandleBodyWidth(width),
    bodyY = Math.min(openY, closeY),
    trueHeight = Math.abs(openY - closeY),
    bodyHeight = Math.max(3, trueHeight),
    color =
      payload.direction === "up"
        ? theme.primary
        : payload.direction === "down"
          ? theme.secondary
          : theme.fourth;
  return (
    <g
      data-ohlc-candle={payload.label}
      data-direction={payload.direction}
      data-focus={payload.focus ? "true" : "false"}
      data-open={payload.open!}
      data-high={payload.high!}
      data-low={payload.low!}
      data-close={payload.close!}
      data-wick-top={highY}
      data-wick-bottom={lowY}
      data-body-top={bodyY}
      data-body-height={bodyHeight}
    >
      <line
        data-ohlc-wick
        x1={center}
        x2={center}
        y1={highY}
        y2={lowY}
        stroke={color}
        strokeWidth={payload.focus ? 4 : 3}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="ohlc-wick"
            attributeName="y2"
            from={highY}
            to={lowY}
            dur="0.62s"
            fill="freeze"
          />
        ) : null}
      </line>
      <rect
        data-ohlc-body
        x={center - bodyWidth / 2}
        y={trueHeight < 3 ? bodyY - 1.5 : bodyY}
        width={bodyWidth}
        height={bodyHeight}
        fill={payload.direction === "down" ? theme.background : color}
        stroke={color}
        strokeWidth={payload.focus ? 3 : 2}
      >
        {payload.animate ? (
          <animate
            data-mav-entry="ohlc-body"
            attributeName="height"
            from="0"
            to={bodyHeight}
            dur="0.62s"
            fill="freeze"
          />
        ) : null}
      </rect>
      <line
        data-ohlc-open
        x1={center - bodyWidth / 2}
        x2={center}
        y1={openY}
        y2={openY}
        stroke={color}
        strokeWidth="2"
      />
      <line
        data-ohlc-close
        x1={center}
        x2={center + bodyWidth / 2}
        y1={closeY}
        y2={closeY}
        stroke={color}
        strokeWidth="2"
      />
    </g>
  );
}
function OhlcTooltip({
  active,
  label,
  data,
  theme,
  unit,
}: {
  active?: boolean;
  label?: string;
  data: readonly OhlcGeometryDatum[];
  theme: VisualSystemTokens;
  unit: string;
}) {
  const candle = data.find((datum) => datum.label === label);
  if (!active || !candle) return null;
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
      <strong>{candle.label}</strong>
      {candle.missing ? (
        <div>Missing whole candle</div>
      ) : (
        <>
          <div>
            Open {formatOhlcValue(candle.open!)}
            {unit}
          </div>
          <div>
            High {formatOhlcValue(candle.high!)}
            {unit}
          </div>
          <div>
            Low {formatOhlcValue(candle.low!)}
            {unit}
          </div>
          <div>
            Close {formatOhlcValue(candle.close!)}
            {unit}
          </div>
          <div>
            {candle.direction.toUpperCase()} · Δ{" "}
            {formatOhlcValue(candle.change!)}
            {unit}
          </div>
        </>
      )}
    </div>
  );
}

export function OhlcGeometry({
  data,
  theme,
  animate = true,
  unit = "",
}: {
  data: readonly OhlcDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  unit?: string;
}) {
  const domain = getOhlcDomain(data),
    geometry = buildOhlcGeometry(data).map((datum) => ({ ...datum, animate })),
    latest = [...geometry].reverse().find((datum) => !datum.missing) ?? null,
    [activeIndex, setActiveIndex] = useState<number | null>(null),
    active = activeIndex === null ? null : geometry[activeIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !geometry.length ||
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    setActiveIndex((current) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? geometry.length - 1
          : event.key === "ArrowRight"
            ? ((current ?? 0) + 1) % geometry.length
            : ((current ?? 0) - 1 + geometry.length) % geometry.length,
    );
  };
  return (
    <div
      role="group"
      aria-label="OHLC candlestick interactive chart"
      tabIndex={0}
      onFocus={() => setActiveIndex((current) => current ?? 0)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={handleKeyDown}
      data-ohlc-animation={animate ? "true" : "false"}
      data-domain-min={domain[0]}
      data-domain-max={domain[1]}
      data-candle-count={geometry.filter((datum) => !datum.missing).length}
      data-missing-count={geometry.filter((datum) => datum.missing).length}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        outline: "none",
      }}
    >
      <div
        role="list"
        aria-label="OHLC legend"
        data-ohlc-legend
        style={{
          position: "absolute",
          zIndex: 4,
          top: 4,
          right: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span role="listitem">
          <b style={{ color: theme.primary }}>■</b> Up
        </span>
        <span role="listitem">
          <b style={{ color: theme.secondary }}>□</b> Down
        </span>
        <span role="listitem">
          <b style={{ color: theme.fourth }}>━</b> Flat
        </span>
        <span role="listitem">Wick = low–high</span>
        <span role="listitem">Missing = no candle</span>
      </div>
      {latest ? (
        <div
          data-ohlc-direct-label
          style={{
            position: "absolute",
            zIndex: 4,
            top: 25,
            right: 8,
            color:
              latest.direction === "up"
                ? theme.primary
                : latest.direction === "down"
                  ? theme.secondary
                  : theme.fourth,
            fontSize: theme.label.fontSize,
            fontWeight: theme.label.fontWeight,
          }}
        >
          LATEST · {formatOhlcLabel(latest.label, 18)} · CLOSE{" "}
          {formatOhlcValue(latest.close!)}
          {unit} · {latest.direction.toUpperCase()}
        </div>
      ) : null}
      <div data-ohlc-plot style={{ position: "absolute", inset: "50px 0 0" }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={geometry}
            margin={{ top: 18, right: 54, bottom: 34, left: 8 }}
            accessibilityLayer
          >
            <CartesianGrid
              stroke={theme.grid}
              strokeDasharray={theme.chart.gridDash}
            />
            <XAxis
              dataKey="label"
              tickFormatter={(label) => formatOhlcLabel(String(label), 5)}
              tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
              axisLine={false}
              tickLine={false}
              interval={0}
            />
            <YAxis
              domain={[...domain]}
              tickFormatter={(value) => formatOhlcValue(Number(value))}
              tick={{ fill: theme.muted, fontSize: theme.label.fontSize }}
              axisLine={false}
              tickLine={false}
              width={62}
            />
            <Tooltip
              cursor={{ fill: theme.grid, fillOpacity: 0.16 }}
              content={({ active, label }) => (
                <OhlcTooltip
                  active={active}
                  label={String(label ?? "")}
                  data={geometry}
                  theme={theme}
                  unit={unit}
                />
              )}
            />
            <Bar
              dataKey="plotHigh"
              name="OHLC"
              barSize="62%"
              shape={(props: unknown) => (
                <CandleShape
                  {...(props as Omit<CandleProps, "domain" | "theme">)}
                  domain={domain}
                  theme={theme}
                />
              )}
              {...getOhlcMotion(theme.key, animate)}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
      {active ? (
        <div
          role="status"
          style={{
            position: "absolute",
            zIndex: 5,
            right: 8,
            bottom: 4,
            maxWidth: "86%",
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.label}:{" "}
          {active.missing
            ? "Missing whole candle"
            : `open ${formatOhlcValue(active.open!)}${unit}; high ${formatOhlcValue(active.high!)}${unit}; low ${formatOhlcValue(active.low!)}${unit}; close ${formatOhlcValue(active.close!)}${unit}; ${active.direction}`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="OHLC trading sessions"
        rows={geometry}
        columns={[
          { key: "label", label: "Session", value: (datum) => datum.label },
          {
            key: "open",
            label: "Open",
            value: (datum) =>
              datum.missing ? "Missing" : formatOhlcValue(datum.open!),
          },
          {
            key: "high",
            label: "High",
            value: (datum) =>
              datum.missing ? "Missing" : formatOhlcValue(datum.high!),
          },
          {
            key: "low",
            label: "Low",
            value: (datum) =>
              datum.missing ? "Missing" : formatOhlcValue(datum.low!),
          },
          {
            key: "close",
            label: "Close",
            value: (datum) =>
              datum.missing ? "Missing" : formatOhlcValue(datum.close!),
          },
          {
            key: "direction",
            label: "Direction",
            value: (datum) => datum.direction,
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
export function OhlcCandlestickChart({
  data = ohlcExample,
  visualSystem = "signal",
  animate,
  title = "Friday closed at the week’s high-water mark",
  subtitle = "OHLC · SHARED PRICE SCALE · WICK + BODY",
  unit = "",
}: OhlcCandlestickChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateOhlcData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="B05"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · OHLC CANDLESTICK`}
      theme={theme}
      state={state}
      description="Complete OHLC candles on one honest padded price domain; missing sessions receive no wick or body."
    >
      <OhlcGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveOhlcAnimation(animate, usePrefersReducedMotion())}
        unit={unit}
      />
    </ChartShell>
  );
}
export {
  buildOhlcGeometry,
  getCandleBodyWidth,
  getOhlcDomain,
  mapOhlcY,
  validateOhlcData,
} from "./schema";
export type { CandleDirection, OhlcDatum, OhlcGeometryDatum } from "./schema";
export { ohlcExample, ohlcEdgeCases } from "./example-data";
export { ohlcMetadata } from "./metadata";
