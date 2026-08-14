export type NestedTreemapDatum = { path: readonly string[]; value: number | null; detail?: string };
export type NestedTreemapLeaf = NestedTreemapDatum & { index: number; label: string; pathKey: string; missing: boolean; zero: boolean; renderable: boolean; focus: boolean; share: number | null };
export type NestedTreemapNode = { name: string; pathKey: string; value: number; nodeDepth: number; leaf: boolean; focus: boolean; inputIndex?: number; share: number; children?: NestedTreemapNode[] };

export function validateNestedTreemapData(data: readonly NestedTreemapDatum[]) {
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

type MutableNode = NestedTreemapNode & { children?: MutableNode[] };
export function buildNestedTreemapGeometry(data: readonly NestedTreemapDatum[]) {
  const total = data.reduce((sum, datum) => sum + (datum.value !== null && datum.value > 0 ? datum.value : 0), 0);
  const focusIndex = data.findIndex((datum) => datum.value !== null && datum.value > 0);
  const leaves: readonly NestedTreemapLeaf[] = data.map((datum, index) => ({ ...datum, index, label: datum.path.at(-1) ?? "", pathKey: datum.path.join(" / "), missing: datum.value === null, zero: datum.value === 0, renderable: datum.value !== null && datum.value > 0, focus: index === focusIndex, share: datum.value !== null && datum.value > 0 && total > 0 ? datum.value / total : null }));
  const roots: MutableNode[] = [];
  for (const leaf of leaves.filter((item) => item.renderable)) {
    let siblings = roots;
    leaf.path.forEach((raw, depth) => {
      const name = raw.trim(), pathKey = leaf.path.slice(0, depth + 1).join(" / "), terminal = depth === leaf.path.length - 1;
      let node = siblings.find((item) => item.name === name);
      if (!node) { node = { name, pathKey, value: 0, nodeDepth: depth + 1, leaf: terminal, focus: terminal && leaf.focus, inputIndex: terminal ? leaf.index : undefined, share: 0, ...(terminal ? {} : { children: [] }) }; siblings.push(node); }
      node.value += leaf.value!;
      if (!terminal) siblings = node.children!;
    });
  }
  const finalize = (node: MutableNode): NestedTreemapNode => ({ ...node, share: total > 0 ? node.value / total : 0, ...(node.children ? { children: node.children.map(finalize) } : {}) });
  return { roots: roots.map(finalize), leaves, total, maximumDepth: leaves.reduce((max, leaf) => Math.max(max, leaf.path.length), 0) } as const;
}

export const getNestedTreemapArea = (value: number, total: number, plotArea: number) => total > 0 && value > 0 ? value / total * plotArea : 0;

