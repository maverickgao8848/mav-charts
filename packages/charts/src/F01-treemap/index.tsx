import { useState, type KeyboardEvent } from "react";
import { ResponsiveContainer, Treemap, type TreemapNode } from "recharts";
import { getVisualSystem, type VisualSystemId, type VisualSystemTokens } from "@mav-charts/themes";
import { AccessibleDataTable } from "../core/AccessibleDataTable";
import { ChartShell } from "../core/ChartShell";
import { usePrefersReducedMotion } from "../core/usePrefersReducedMotion";
import { treemapExample } from "./example-data";
import { getTreemapMotion } from "./motion";
import { buildTreemapGeometry, validateTreemapData, type TreemapDatum, type TreemapGeometryDatum } from "./schema";

export type TreemapChartProps = {
  data?: readonly TreemapDatum[];
  visualSystem?: VisualSystemId;
  animate?: boolean;
  title?: string;
  subtitle?: string;
  unit?: string;
};

export const formatTreemapValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1_000_000_000) return `${Number((value / 1_000_000_000).toFixed(1))}B`;
  if (absolute >= 1_000_000) return `${Number((value / 1_000_000).toFixed(1))}M`;
  if (absolute >= 1_000) return `${Number((value / 1_000).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};
export const formatTreemapLabel = (label: string, maximum = 18) => label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
export const resolveTreemapAnimation = (animate: boolean | undefined, reducedMotion: boolean) => animate ?? !reducedMotion;
export const minimumVisibleTreemapShare = 0.00002;

type RenderNode = TreemapNode & TreemapGeometryDatum;
const tileColor = (theme: VisualSystemTokens, tile: RenderNode) => tile.focus ? theme.primary : tile.index % 2 ? theme.secondary : theme.fourth;
const tileText = (theme: VisualSystemTokens, tile: RenderNode) => tile.focus ? theme.background : tile.index % 2 ? (theme.key === "signal" ? theme.fourth : theme.background) : theme.secondary;

function TreemapCell({ theme, animate, ...node }: RenderNode & { theme: VisualSystemTokens; animate: boolean }) {
  if (node.depth !== 1 || node.width <= 0 || node.height <= 0) return <g />;
  const showLabel = node.width >= 74 && node.height >= 44;
  const showParent = showLabel && node.width >= 112 && node.height >= 74 && node.parent;
  return <g data-treemap-tile={node.label} data-focus={node.focus ? "true" : "false"} data-value={node.value} data-share={node.share ?? ""} data-parent={node.parent ?? ""}>
    <rect x={node.x} y={node.y} width={node.width} height={node.height} fill={tileColor(theme, node)} stroke={theme.background} strokeWidth={4}>
      {animate ? <animate data-mav-entry="treemap-tile" attributeName="opacity" from="0" to="1" dur="0.68s" fill="freeze" /> : null}
    </rect>
    {showLabel ? <text data-treemap-label={node.label} x={node.x + node.width / 2} y={node.y + node.height / 2 - (showParent ? 11 : 5)} textAnchor="middle" fill={tileText(theme, node)} fontSize={theme.label.fontSize + 2} fontWeight={900}>
      <tspan x={node.x + node.width / 2}>{formatTreemapLabel(node.label, Math.max(7, Math.floor(node.width / 8)))}</tspan>
      <tspan x={node.x + node.width / 2} dy="18">{(node.share! * 100).toFixed(node.share! < .01 ? 1 : 0)}%</tspan>
      {showParent ? <tspan x={node.x + node.width / 2} dy="16" fontSize={theme.label.fontSize - 1} fontWeight={theme.label.fontWeight}>{formatTreemapLabel(node.parent!, Math.max(7, Math.floor(node.width / 9)))}</tspan> : null}
    </text> : null}
  </g>;
}

export function TreemapGeometry({ data, theme, animate = true, unit = "" }: { data: readonly TreemapDatum[]; theme: VisualSystemTokens; animate?: boolean; unit?: string }) {
  const built = buildTreemapGeometry(data);
  const visibleTiles = built.renderable.filter((tile) => (tile.share ?? 0) >= minimumVisibleTreemapShare);
  const subpixelCount = built.renderable.length - visibleTiles.length;
  const [hovered, setHovered] = useState<TreemapGeometryDatum | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : built.tiles[activeIndex];
  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!built.tiles.length || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return;
    event.preventDefault();
    setActiveIndex((current) => event.key === "Home" ? 0 : event.key === "End" ? built.tiles.length - 1 : event.key === "ArrowRight" ? ((current ?? 0) + 1) % built.tiles.length : ((current ?? 0) - 1 + built.tiles.length) % built.tiles.length);
  };
  return <div role="group" aria-label="Treemap interactive chart" tabIndex={0} onFocus={() => setActiveIndex((current) => current ?? 0)} onBlur={() => setActiveIndex(null)} onKeyDown={handleKeyDown} data-treemap-animation={animate ? "true" : "false"} data-total={built.total} data-positive-count={built.renderable.length} data-rendered-count={visibleTiles.length} data-subpixel-count={subpixelCount} data-missing-count={built.tiles.filter((tile) => tile.missing).length} data-zero-count={built.tiles.filter((tile) => tile.zero).length} style={{ position: "relative", width: "100%", height: "100%", boxSizing: "border-box", paddingTop: 6, outline: "none", display: "grid", gridTemplateRows: "auto minmax(0, 1fr)", rowGap: 2 }}>
    <div role="list" aria-label="Treemap legend" data-treemap-legend style={{ position: "relative", zIndex: 3, justifySelf: "end", padding: "0 8px 4px", display: "flex", flexWrap: "wrap", justifyContent: "flex-end", gap: theme.legend.gap, color: theme.muted, fontSize: theme.legend.fontSize }}>
      <span role="listitem"><b style={{ color: theme.primary }}>■</b> Focus</span><span role="listitem"><b style={{ color: theme.secondary }}>■</b> Context</span><span role="listitem">Area = value / reported total</span><span role="listitem">Missing/zero/sub-pixel = no tile</span>
    </div>
    {visibleTiles.length ? <ResponsiveContainer width="100%" height="100%"><Treemap data={visibleTiles} dataKey="value" nameKey="label" type="flat" aspectRatio={4 / 3} nodeGap={2} content={(node) => <TreemapCell {...node as RenderNode} theme={theme} animate={animate} />} onMouseEnter={(node) => setHovered(node as RenderNode)} onMouseLeave={() => setHovered(null)} {...getTreemapMotion(theme.key, animate)} /></ResponsiveContainer> : <div data-treemap-no-area style={{ display: "grid", width: "100%", height: "100%", placeItems: "center", color: theme.muted, fontSize: theme.label.fontSize }}>NO VISIBLE POSITIVE AREA · ZERO, MISSING AND SUB-PIXEL ROWS REMAIN IN TABLE</div>}
    {subpixelCount ? <div data-treemap-subpixel-note style={{ position: "absolute", zIndex: 3, left: 8, bottom: 4, color: theme.muted, fontSize: theme.label.fontSize }}>{subpixelCount} SUB-PIXEL {subpixelCount === 1 ? "VALUE" : "VALUES"} · TABLE ONLY</div> : null}
    {hovered ? <div role="tooltip" style={{ position: "absolute", zIndex: 4, right: 8, bottom: 4, padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}><strong>{hovered.label}</strong><div>Value: {formatTreemapValue(hovered.value!)}{unit}</div><div>Share: {(hovered.share! * 100).toFixed(1)}%</div>{hovered.parent ? <div>Parent: {hovered.parent}</div> : null}</div> : null}
    {active ? <div role="status" style={{ position: "absolute", zIndex: 4, right: 8, bottom: 4, maxWidth: "80%", padding: theme.tooltip.padding, border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`, background: theme.surfaceAlt, color: theme.text, fontSize: theme.label.fontSize }}>{active.label}: {active.missing ? "Missing; no tile" : active.zero ? "Zero; no visible area" : `${formatTreemapValue(active.value!)}${unit}; ${(active.share! * 100).toFixed(1)}% of reported total`}{active.parent ? `; parent ${active.parent}` : ""}</div> : null}
    <AccessibleDataTable caption="Treemap categories" rows={built.tiles} columns={[{ key: "label", label: "Category", value: (tile) => tile.label }, { key: "value", label: "Value", value: (tile) => tile.missing ? "Missing" : formatTreemapValue(tile.value!) }, { key: "share", label: "Share of reported total", value: (tile) => tile.share === null ? (tile.zero ? "Zero" : "Missing") : `${(tile.share * 100).toFixed(2)}%` }, { key: "parent", label: "Parent context", value: (tile) => tile.parent ?? "" }, { key: "detail", label: "Detail", value: (tile) => tile.detail ?? "" }]} />
  </div>;
}

export function TreemapChart({ data = treemapExample, visualSystem = "signal", animate, title = "The leader controls one third of the reported market", subtitle = "MARKET MAP · AREA ENCODES REPORTED VALUE", unit = "" }: TreemapChartProps) {
  const theme = getVisualSystem(visualSystem);
  const validation = validateTreemapData(data);
  const state = data.length === 0 ? "empty" : validation.valid ? "ready" : "invalid";
  return <ChartShell code="F01" title={title} subtitle={subtitle} source={`${theme.name.toUpperCase()} · TREEMAP`} theme={theme} state={state} description="One-level composition where positive area is proportional to value and missing or zero rows receive no tile."><TreemapGeometry data={validation.valid ? data : []} theme={theme} animate={resolveTreemapAnimation(animate, usePrefersReducedMotion())} unit={unit} /></ChartShell>;
}

export { buildTreemapGeometry, getTreemapArea, validateTreemapData } from "./schema";
export type { TreemapDatum, TreemapGeometryDatum } from "./schema";
export { treemapExample, treemapEdgeCases } from "./example-data";
export { treemapMetadata } from "./metadata";
