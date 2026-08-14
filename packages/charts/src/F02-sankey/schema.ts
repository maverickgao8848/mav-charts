export type SankeyDatum = {
  source: string;
  target: string;
  value: number | null;
  detail?: string;
};

export type SankeyGeometryNode = { name: string; index: number };
export type SankeyGeometryLink = {
  source: number;
  target: number;
  value: number;
  sourceName: string;
  targetName: string;
  detail?: string;
  inputIndex: number;
  focused: boolean;
};
export type SankeyGeometryResult = {
  nodes: readonly SankeyGeometryNode[];
  links: readonly SankeyGeometryLink[];
  total: number;
};

const finitePositive = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value > 0;

export function validateSankeyData(data: readonly SankeyDatum[]) {
  const errors: string[] = [];
  const pairs = new Set<string>();
  const adjacency = new Map<string, string[]>();
  data.forEach((datum, index) => {
    const source = datum.source.trim();
    const target = datum.target.trim();
    if (!source || !target)
      errors.push(`Link ${index} requires non-empty source and target labels.`);
    if (source && source === target)
      errors.push(`Link ${index} cannot connect a node to itself.`);
    if (datum.value !== null && !finitePositive(datum.value))
      errors.push(
        `Link ${index} value must be finite and greater than zero, or null.`,
      );
    const key = `${source}\u0000${target}`;
    if (pairs.has(key))
      errors.push(`Link ${index} duplicates ${source} to ${target}.`);
    pairs.add(key);
    if (source && target && datum.value !== null)
      adjacency.set(source, [...(adjacency.get(source) ?? []), target]);
  });
  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (node: string): boolean => {
    if (visiting.has(node)) return true;
    if (visited.has(node)) return false;
    visiting.add(node);
    const cyclic = (adjacency.get(node) ?? []).some(visit);
    visiting.delete(node);
    visited.add(node);
    return cyclic;
  };
  if ([...adjacency.keys()].some(visit))
    errors.push("Sankey links must form a directed acyclic graph.");
  return { valid: errors.length === 0, errors } as const;
}

export function buildSankeyGeometry(
  data: readonly SankeyDatum[],
): SankeyGeometryResult {
  const nodeNames: string[] = [];
  const nodeIndex = new Map<string, number>();
  const indexFor = (name: string) => {
    const existing = nodeIndex.get(name);
    if (existing !== undefined) return existing;
    const index = nodeNames.length;
    nodeNames.push(name);
    nodeIndex.set(name, index);
    return index;
  };
  const valid = data
    .map((datum, inputIndex) => ({
      ...datum,
      source: datum.source.trim(),
      target: datum.target.trim(),
      inputIndex,
    }))
    .filter((datum): datum is typeof datum & { value: number } =>
      finitePositive(datum.value),
    );
  valid.forEach(({ source, target }) => {
    indexFor(source);
    indexFor(target);
  });
  const maximum = Math.max(0, ...valid.map(({ value }) => value));
  const focusedInputIndex = valid.find(
    ({ value }) => value === maximum,
  )?.inputIndex;
  return {
    nodes: nodeNames.map((name, index) => ({ name, index })),
    links: valid.map(({ source, target, value, detail, inputIndex }) => ({
      source: indexFor(source),
      target: indexFor(target),
      value,
      sourceName: source,
      targetName: target,
      detail,
      inputIndex,
      focused: inputIndex === focusedInputIndex,
    })),
    total: valid.reduce((sum, link) => sum + link.value, 0),
  };
}

export const formatSankeyValue = (value: number) => {
  const absolute = Math.abs(value);
  if (absolute >= 1e9) return `${Number((value / 1e9).toFixed(1))}B`;
  if (absolute >= 1e6) return `${Number((value / 1e6).toFixed(1))}M`;
  if (absolute >= 1e3) return `${Number((value / 1e3).toFixed(1))}K`;
  return Number(value.toFixed(3)).toString();
};

export const formatSankeyLabel = (label: string, maximum = 15) =>
  label.length > maximum ? `${label.slice(0, maximum - 1).trimEnd()}…` : label;
