import {
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from "react";
import { Sankey } from "recharts";
import {
  getVisualSystem,
  type VisualSystemId,
  type VisualSystemTokens,
} from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { sankeyExample } from "./example-data";
import { getSankeyMotion } from "./motion";
import {
  buildSankeyGeometry,
  formatSankeyLabel,
  formatSankeyValue,
  validateSankeyData,
  type SankeyDatum,
  type SankeyGeometryLink,
} from "./schema";

export type SankeyChartProps = {
  data?: readonly SankeyDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  unit?: string;
};

export const resolveSankeyAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;

function useSankeySize() {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 560, height: 360 });
  useEffect(() => {
    if (!ref.current || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) =>
      setSize({
        width: Math.max(280, entry.contentRect.width),
        height: Math.max(300, entry.contentRect.height),
      }),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return { ref, size, compact: size.width < 480 };
}

type SankeyNodeShapeProps = {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  index?: number;
  payload?: { name?: string; depth?: number };
  theme: VisualSystemTokens;
  compact: boolean;
  animate: boolean;
};
function SankeyNodeShape({
  x = 0,
  y = 0,
  width = 0,
  height = 0,
  index = 0,
  payload,
  theme,
  compact,
  animate,
}: SankeyNodeShapeProps) {
  const name = payload?.name ?? "";
  const focus = index === 0;
  const color = focus && theme.key === "signal" ? theme.primary : theme.text;
  const anchor = compact
    ? "middle"
    : (payload?.depth ?? 0) >= 2
      ? "end"
      : "start";
  const labelX = compact
    ? x + width / 2
    : anchor === "end"
      ? x - 7
      : x + width + 7;
  const labelY = compact ? y - 7 : y + height / 2;
  return (
    <g data-sankey-node={name} data-node-index={index}>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={color}
        stroke={theme.background}
        strokeWidth={1}
      >
        {animate ? (
          <animate
            data-mav-entry="sankey-node"
            attributeName="opacity"
            from="0"
            to="1"
            dur=".62s"
            fill="freeze"
          />
        ) : null}
      </rect>
      <text
        data-sankey-node-label={name}
        x={labelX}
        y={labelY}
        dy={compact ? 0 : ".35em"}
        textAnchor={anchor}
        fill={focus ? theme.primary : theme.text}
        fontSize={compact ? 8 : 10}
        fontWeight={theme.label.fontWeight}
      >
        {formatSankeyLabel(name, compact ? 8 : 17)}
      </text>
    </g>
  );
}

type SankeyLinkShapeProps = {
  sourceX?: number;
  targetX?: number;
  sourceY?: number;
  targetY?: number;
  sourceControlX?: number;
  targetControlX?: number;
  sourceRelativeY?: number;
  targetRelativeY?: number;
  linkWidth?: number;
  index?: number;
  payload?: SankeyGeometryLink;
  theme: VisualSystemTokens;
  unit: string;
  compact: boolean;
  animate: boolean;
  onHover: (link: SankeyGeometryLink | null) => void;
};
function SankeyLinkShape({
  sourceX = 0,
  targetX = 0,
  sourceY = 0,
  targetY = 0,
  sourceControlX = 0,
  targetControlX = 0,
  sourceRelativeY = 0,
  targetRelativeY = 0,
  linkWidth = 0,
  index = 0,
  payload,
  theme,
  unit,
  compact,
  animate,
  onHover,
}: SankeyLinkShapeProps): ReactElement {
  const y0 = sourceY;
  const y1 = targetY;
  const path = `M${sourceX},${y0}C${sourceControlX},${y0} ${targetControlX},${y1} ${targetX},${y1}`;
  const focused = Boolean(payload?.focused);
  const color =
    focused && theme.key === "signal"
      ? theme.primary
      : theme.key === "signal"
        ? theme.text
        : focused
          ? theme.primary
          : theme.secondary;
  const motion = getSankeyMotion(theme.key, animate, index);
  return (
    <g
      data-sankey-link={
        payload ? `${payload.sourceName}→${payload.targetName}` : index
      }
      data-link-value={payload?.value}
      data-link-width={linkWidth}
      onMouseEnter={() => payload && onHover(payload)}
      onMouseLeave={() => onHover(null)}
    >
      <path
        d={path}
        fill="none"
        stroke="transparent"
        strokeWidth={Math.max(10, linkWidth)}
      />
      <path
        data-sankey-ribbon
        d={path}
        fill="none"
        stroke={color}
        strokeWidth={linkWidth}
        strokeOpacity={focused ? 0.78 : 0.26}
      >
        {motion.animate ? (
          <animate
            data-mav-entry="sankey-link"
            attributeName="stroke-opacity"
            from="0"
            to={focused ? ".78" : ".26"}
            begin={`${motion.delayMs}ms`}
            dur={`${motion.durationMs}ms`}
            fill="freeze"
          />
        ) : null}
      </path>
      {payload && (!compact || focused || payload.value >= 20) ? (
        <text
          data-sankey-link-label={`${payload.sourceName}→${payload.targetName}`}
          x={(sourceX + targetX) / 2}
          y={(y0 + y1) / 2 - 5}
          textAnchor="middle"
          fill={focused ? theme.primary : theme.text}
          fontSize={compact ? 8 : 9}
          fontWeight={theme.label.fontWeight}
        >
          {formatSankeyValue(payload.value)}
          {unit}
        </text>
      ) : null}
    </g>
  );
}

export function SankeyGeometry({
  data,
  theme,
  animate = true,
  unit = "",
}: {
  data: readonly SankeyDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  unit?: string;
}) {
  const geometry = buildSankeyGeometry(data);
  const { ref, size, compact } = useSankeySize();
  const [hovered, setHovered] = useState<SankeyGeometryLink | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : geometry.links[activeIndex];
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !geometry.links.length ||
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    setActiveIndex((current) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? geometry.links.length - 1
          : event.key === "ArrowRight"
            ? ((current ?? 0) + 1) % geometry.links.length
            : ((current ?? 0) - 1 + geometry.links.length) %
              geometry.links.length,
    );
  };
  return (
    <div
      ref={ref}
      role="group"
      aria-label="Sankey interactive chart"
      data-animation-enabled={animate ? "true" : "false"}
      data-visible-links={geometry.links.length}
      data-visible-nodes={geometry.nodes.length}
      data-flow-total={geometry.total}
      tabIndex={0}
      onFocus={() => setActiveIndex((current) => current ?? 0)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={onKeyDown}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        outline: "none",
      }}
    >
      <div
        role="list"
        aria-label="Sankey legend"
        data-sankey-legend
        style={{
          position: "absolute",
          zIndex: 3,
          top: 4,
          right: 8,
          display: "flex",
          flexWrap: "wrap",
          gap: theme.legend.gap,
          color: theme.muted,
          fontSize: theme.legend.fontSize,
        }}
      >
        <span role="listitem" style={{ color: theme.primary }}>
          ━ Largest flow
        </span>
        <span role="listitem">RIBBON WIDTH = VALUE</span>
        <span role="listitem">DIRECTION LEFT → RIGHT</span>
      </div>
      {geometry.links.length ? (
        <Sankey
          width={size.width}
          height={size.height}
          data={{ nodes: [...geometry.nodes], links: [...geometry.links] }}
          nodeWidth={compact ? 8 : 10}
          nodePadding={compact ? 18 : 24}
          margin={{
            top: compact ? 76 : 58,
            right: compact ? 74 : 100,
            bottom: 34,
            left: compact ? 64 : 88,
          }}
          iterations={40}
          sort={false}
          node={(props) => (
            <SankeyNodeShape
              {...props}
              theme={theme}
              compact={compact}
              animate={animate}
            />
          )}
          link={(props) => (
            <SankeyLinkShape
              {...(props as unknown as SankeyLinkShapeProps)}
              theme={theme}
              unit={unit}
              compact={compact}
              animate={animate}
              onHover={setHovered}
            />
          )}
        />
      ) : null}
      {hovered ? (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            zIndex: 5,
            right: 8,
            bottom: 4,
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            borderRadius: theme.tooltip.radius,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          <strong>
            {hovered.sourceName} → {hovered.targetName}
          </strong>
          <div>
            {formatSankeyValue(hovered.value)}
            {unit}
          </div>
          {hovered.detail ? (
            <small style={{ color: theme.muted }}>{hovered.detail}</small>
          ) : null}
        </div>
      ) : null}
      {active ? (
        <div
          role="status"
          style={{
            position: "absolute",
            zIndex: 4,
            right: 8,
            bottom: 4,
            maxWidth: "78%",
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.sourceName} to {active.targetName}:{" "}
          {formatSankeyValue(active.value)}
          {unit}
          {active.detail ? `; ${active.detail}` : ""}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Directed Sankey flows"
        rows={data}
        columns={[
          { key: "source", label: "Source", value: (row) => row.source },
          { key: "target", label: "Target", value: (row) => row.target },
          {
            key: "value",
            label: "Flow",
            value: (row) =>
              row.value === null
                ? "Missing"
                : `${formatSankeyValue(row.value)}${unit}`,
          },
          { key: "detail", label: "Detail", value: (row) => row.detail ?? "" },
        ]}
      />
    </div>
  );
}

export function SankeyChart({
  data = sankeyExample,
  visualSystem = "signal",
  animate,
  title = "Production feeds two routes to customers",
  subtitle = "VALUE CHAIN · RIBBON WIDTH = FLOW",
  unit = "",
}: SankeyChartProps) {
  const theme = getVisualSystem(visualSystem);
  const validation = validateSankeyData(data);
  const state =
    data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="F02"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · SANKEY`}
      theme={theme}
      state={state}
      description="Positive caller-supplied flows through a directed acyclic value chain; ribbon width encodes value and no balancing flow is inferred."
    >
      <SankeyGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveSankeyAnimation(animate, usePrefersReducedMotion())}
        unit={unit}
      />
    </ChartShell>
  );
}

export {
  buildSankeyGeometry,
  formatSankeyLabel,
  formatSankeyValue,
  validateSankeyData,
} from "./schema";
export type {
  SankeyDatum,
  SankeyGeometryResult,
  SankeyGeometryLink,
  SankeyGeometryNode,
} from "./schema";
export { sankeyExample, sankeyEdgeCases } from "./example-data";
export { sankeyMetadata } from "./metadata";
