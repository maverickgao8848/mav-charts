import { useState, type KeyboardEvent } from "react";
import {
  ResponsiveContainer,
  SunburstChart,
  type SunburstData,
} from "recharts";
import {
  getVisualSystem,
  type VisualSystemId,
  type VisualSystemTokens,
} from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { sunburstExample } from "./example-data";
import { getSunburstMotion } from "./motion";
import {
  buildSunburstGeometry,
  validateSunburstData,
  type SunburstDatum,
  type SunburstGeometryNode,
  type SunburstLeaf,
} from "./schema";
export type SunburstHierarchyChartProps = {
  data?: readonly SunburstDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  unit?: string;
};
export const formatSunburstValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const formatSunburstLabel = (label: string, max = 18) =>
  label.length > max ? `${label.slice(0, max - 1).trimEnd()}…` : label;
export const resolveSunburstAnimation = (
  animate: boolean | undefined,
  reduced: boolean,
) => animate ?? !reduced;
type RenderNode = SunburstGeometryNode & SunburstData;
const colorTree = (
  nodes: readonly SunburstGeometryNode[],
  theme: VisualSystemTokens,
): RenderNode[] =>
  nodes.map((node, index) => ({
    ...node,
    name: node.pathKey,
    fill: node.focus
      ? theme.primary
      : node.leaf
        ? (node.inputIndex ?? 0) % 2
          ? theme.secondary
          : theme.fourth
        : index % 2
          ? theme.secondary
          : theme.fourth,
    ...(node.children ? { children: colorTree(node.children, theme) } : {}),
  }));

export function SunburstGeometry({
  data,
  theme,
  animate = true,
  unit = "",
}: {
  data: readonly SunburstDatum[];
  theme: VisualSystemTokens;
  animate?: boolean;
  unit?: string;
}) {
  const built = buildSunburstGeometry(data),
    focus = built.leaves.find((leaf) => leaf.focus) ?? null,
    tree: SunburstData & { children: RenderNode[] } = {
      name: "Reported total",
      value: built.total,
      children: colorTree(built.roots, theme),
    },
    motion = getSunburstMotion(theme.key, animate),
    [hovered, setHovered] = useState<RenderNode | null>(null),
    [activeIndex, setActiveIndex] = useState<number | null>(null),
    active = activeIndex === null ? null : built.leaves[activeIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      !built.leaves.length ||
      !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)
    )
      return;
    event.preventDefault();
    setActiveIndex((current) =>
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? built.leaves.length - 1
          : event.key === "ArrowRight"
            ? ((current ?? 0) + 1) % built.leaves.length
            : ((current ?? 0) - 1 + built.leaves.length) % built.leaves.length,
    );
  };
  return (
    <div
      role="group"
      aria-label="Sunburst interactive chart"
      tabIndex={0}
      onFocus={() => setActiveIndex((current) => current ?? 0)}
      onBlur={() => setActiveIndex(null)}
      onKeyDown={handleKeyDown}
      data-sunburst-animation={motion.enabled ? "true" : "false"}
      data-animation-duration={motion.durationMs}
      data-total={built.total}
      data-leaf-count={built.leaves.filter((leaf) => leaf.renderable).length}
      data-parent-count={built.roots.length}
      data-max-depth={built.maximumDepth}
      data-missing-count={built.leaves.filter((leaf) => leaf.missing).length}
      data-zero-count={built.leaves.filter((leaf) => leaf.zero).length}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        outline: "none",
      }}
    >
      <style>{`@keyframes mav-sunburst-signal{from{opacity:0;transform:scale(.72) rotate(-9deg)}to{opacity:1;transform:scale(1) rotate(0)}}@keyframes mav-sunburst-editorial{from{opacity:0;transform:scale(.8)}to{opacity:1;transform:scale(1)}}@keyframes mav-sunburst-digital{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>
      <div
        role="list"
        aria-label="Sunburst legend"
        data-sunburst-legend
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
          <b style={{ color: theme.primary }}>●</b> Focus leaf
        </span>
        <span role="listitem">
          <b style={{ color: theme.secondary }}>◉</b> Hierarchy
        </span>
        <span role="listitem">Angle = reported value</span>
        <span role="listitem">Radius = depth only</span>
      </div>
      {built.roots.length ? (
        <div
          data-sunburst-plot
          data-mav-entry={motion.enabled ? "sunburst" : undefined}
          style={{
            position: "absolute",
            inset: "40px 0 0",
            animation: motion.enabled
              ? `${motion.animationName} ${motion.durationMs}ms ease-out both`
              : "none",
            transformOrigin: "50% 50%",
          }}
        >
          <ResponsiveContainer width="100%" height="100%">
            <SunburstChart
              data={tree}
              dataKey="value"
              nameKey="name"
              innerRadius={52}
              padding={2}
              ringPadding={3}
              stroke={theme.background}
              fill={theme.secondary}
              textOptions={{
                fontSize: "0px",
                fill: "transparent",
                stroke: "none",
                pointerEvents: "none",
              }}
              onMouseEnter={(node) => setHovered(node as RenderNode)}
              onMouseLeave={() => setHovered(null)}
            />
          </ResponsiveContainer>
        </div>
      ) : (
        <div
          data-sunburst-no-area
          style={{
            display: "grid",
            placeItems: "center",
            width: "100%",
            height: "100%",
            color: theme.muted,
            fontSize: theme.label.fontSize,
          }}
        >
          NO POSITIVE ANGLE · MISSING AND ZERO PATHS REMAIN IN TABLE
        </div>
      )}
      {focus ? (
        <div
          data-sunburst-direct-label
          style={{
            position: "absolute",
            zIndex: 4,
            left: "50%",
            top: "55%",
            width: 112,
            transform: "translate(-50%,-50%)",
            textAlign: "center",
            color: theme.primary,
            fontSize: theme.label.fontSize,
            fontWeight: theme.label.fontWeight,
            pointerEvents: "none",
          }}
        >
          <strong>{formatSunburstLabel(focus.label, 15)}</strong>
          <div>
            {formatSunburstValue(focus.value!)}
            {unit} · {(focus.share! * 100).toFixed(1)}%
          </div>
        </div>
      ) : null}
      <div hidden data-sunburst-manifest>
        {built.roots
          .flatMap(function flatten(node): SunburstGeometryNode[] {
            return [node, ...(node.children?.flatMap(flatten) ?? [])];
          })
          .map((node) => (
            <span
              key={node.pathKey}
              data-sunburst-node={node.pathKey}
              data-node-value={node.value}
              data-node-start={node.startAngle}
              data-node-end={node.endAngle}
              data-node-depth={node.nodeDepth}
              data-node-leaf={node.leaf ? "true" : "false"}
            />
          ))}
      </div>
      {hovered ? (
        <div
          role="tooltip"
          style={{
            position: "absolute",
            right: 8,
            bottom: 4,
            zIndex: 5,
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          <strong>{hovered.pathKey}</strong>
          <div>
            {hovered.leaf ? "Leaf value" : "Descendant total"}:{" "}
            {formatSunburstValue(hovered.value)}
            {unit}
          </div>
          <div>Share: {(hovered.share * 100).toFixed(1)}%</div>
          <div>Depth: {hovered.nodeDepth}</div>
        </div>
      ) : null}
      {active ? (
        <div
          role="status"
          style={{
            position: "absolute",
            right: 8,
            bottom: 4,
            zIndex: 5,
            maxWidth: "82%",
            padding: theme.tooltip.padding,
            border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
            background: theme.surfaceAlt,
            color: theme.text,
            fontSize: theme.label.fontSize,
          }}
        >
          {active.pathKey}:{" "}
          {active.missing
            ? "Missing; no angle"
            : active.zero
              ? "Zero; no visible angle"
              : `${formatSunburstValue(active.value!)}${unit}; ${(active.share! * 100).toFixed(1)}% of reported total`}
        </div>
      ) : null}
      <AccessibleDataTable
        caption="Sunburst leaves"
        rows={built.leaves}
        columns={[
          {
            key: "path",
            label: "Hierarchy path",
            value: (leaf: SunburstLeaf) => leaf.pathKey,
          },
          {
            key: "value",
            label: "Leaf value",
            value: (leaf) =>
              leaf.missing ? "Missing" : formatSunburstValue(leaf.value!),
          },
          {
            key: "share",
            label: "Angular share",
            value: (leaf) =>
              leaf.share === null
                ? leaf.zero
                  ? "Zero"
                  : "Missing"
                : `${(leaf.share * 100).toFixed(2)}%`,
          },
          {
            key: "detail",
            label: "Detail",
            value: (leaf) => leaf.detail ?? "",
          },
        ]}
      />
    </div>
  );
}

export function SunburstHierarchyChart({
  data = sunburstExample,
  visualSystem = "signal",
  animate,
  title = "Hardware occupies almost half of the reported portfolio",
  subtitle = "SUNBURST · ANGLE ENCODES VALUE · RADIUS ENCODES DEPTH",
  unit = "",
}: SunburstHierarchyChartProps) {
  const theme = getVisualSystem(visualSystem),
    validation = validateSunburstData(data),
    state =
      data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return (
    <ChartShell
      code="F06"
      title={title}
      subtitle={subtitle}
      source={`${theme.name.toUpperCase()} · SUNBURST`}
      theme={theme}
      state={state}
      description="Hierarchical paths on honest global angular shares; radial position encodes depth and never extra magnitude."
    >
      <SunburstGeometry
        data={validation.valid ? data : []}
        theme={theme}
        animate={resolveSunburstAnimation(animate, usePrefersReducedMotion())}
        unit={unit}
      />
    </ChartShell>
  );
}
export {
  buildSunburstGeometry,
  getSunburstAngle,
  getSunburstSectorArea,
  validateSunburstData,
} from "./schema";
export type {
  SunburstDatum,
  SunburstGeometryNode,
  SunburstLeaf,
} from "./schema";
export { sunburstExample, sunburstEdgeCases } from "./example-data";
export { sunburstMetadata } from "./metadata";
