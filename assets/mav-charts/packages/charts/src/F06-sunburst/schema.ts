export type SunburstDatum = { path: readonly string[]; value: number | null; detail?: string };
export type SunburstLeaf = SunburstDatum & { index: number; pathKey: string; label: string; missing: boolean; zero: boolean; renderable: boolean; focus: boolean; share: number | null };
export type SunburstGeometryNode = { name: string; pathKey: string; value: number; share: number; nodeDepth: number; leaf: boolean; focus: boolean; inputIndex?: number; startAngle: number; endAngle: number; children?: SunburstGeometryNode[] };

export function validateSunburstData(data: readonly SunburstDatum[]) {
  const errors: string[] = [], paths = new Set<string>();
  data.forEach((datum, index) => {
    if (datum.path.length < 2) errors.push(`Datum ${index} requires at least two hierarchy levels.`);
    if (datum.path.some((segment) => !segment.trim())) errors.push(`Datum ${index} contains a blank path segment.`);
    const key = datum.path.map((segment) => segment.trim()).join("\u0000");
    if (paths.has(key)) errors.push(`Datum ${index} duplicates hierarchy path ${datum.path.join(" / ")}.`);
    paths.add(key);
    if (datum.value !== null && (!Number.isFinite(datum.value) || datum.value < 0)) errors.push(`Datum ${index} value must be finite, non-negative, or null.`);
  });
  return { valid: errors.length === 0, errors } as const;
}

type MutableNode = Omit<SunburstGeometryNode, "startAngle" | "endAngle"> & { children?: MutableNode[] };
export function buildSunburstGeometry(data: readonly SunburstDatum[], startAngle = 0, endAngle = 360) {
  const total = data.reduce((sum, datum) => sum + (datum.value !== null && datum.value > 0 ? datum.value : 0), 0), focusIndex = data.findIndex((datum) => datum.value !== null && datum.value > 0);
  const leaves: readonly SunburstLeaf[] = data.map((datum, index) => ({ ...datum, index, pathKey: datum.path.join(" / "), label: datum.path.at(-1) ?? "", missing: datum.value === null, zero: datum.value === 0, renderable: datum.value !== null && datum.value > 0, focus: index === focusIndex, share: datum.value !== null && datum.value > 0 && total > 0 ? datum.value / total : null }));
  const roots: MutableNode[] = [];
  for (const leaf of leaves.filter((item) => item.renderable)) { let siblings = roots; leaf.path.forEach((raw, depth) => { const name = raw.trim(), key = leaf.path.slice(0, depth + 1).join(" / "), terminal = depth === leaf.path.length - 1; let node = siblings.find((item) => item.name === name); if (!node) { node = { name, pathKey: key, value: 0, share: 0, nodeDepth: depth + 1, leaf: terminal, focus: terminal && leaf.focus, inputIndex: terminal ? leaf.index : undefined, ...(terminal ? {} : { children: [] }) }; siblings.push(node); } node.value += leaf.value!; if (!terminal) siblings = node.children!; }); }
  const span = endAngle - startAngle;
  const assign = (nodes: MutableNode[], parentStart: number): SunburstGeometryNode[] => { let cursor = parentStart; return nodes.map((node) => { const angle = total > 0 ? node.value / total * span : 0, nodeStart = cursor, nodeEnd = cursor + angle; cursor = nodeEnd; return { ...node, share: total > 0 ? node.value / total : 0, startAngle: nodeStart, endAngle: nodeEnd, ...(node.children ? { children: assign(node.children, nodeStart) } : {}) }; }); };
  return { roots: assign(roots, startAngle), leaves, total, maximumDepth: leaves.reduce((max, leaf) => Math.max(max, leaf.path.length), 0), startAngle, endAngle } as const;
}
export const getSunburstAngle = (value: number, total: number, span = 360) => total > 0 && value > 0 ? value / total * span : 0;
export const getSunburstSectorArea = (start: number, end: number, innerRadius: number, outerRadius: number) => Math.abs(end - start) / 360 * Math.PI * (outerRadius ** 2 - innerRadius ** 2);

