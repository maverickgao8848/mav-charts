export type SynchronizedPoint = { label: string; value: number | null; detail?: string };
export type SynchronizedPanel = { id: string; title: string; unit: string; data: readonly SynchronizedPoint[] };
export type SynchronizedGeometryPoint = SynchronizedPoint & { index: number; missing: boolean; latestValid: boolean };
export type SynchronizedGeometryPanel = Omit<SynchronizedPanel, "data"> & { domain: readonly [number, number]; data: readonly SynchronizedGeometryPoint[] };

export function getSynchronizedPanelDomain(panel: SynchronizedPanel): readonly [number, number] {
  const values = panel.data.map(({ value }) => value).filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return [0, 1];
  const minimum = Math.min(...values), maximum = Math.max(...values);
  if (minimum === maximum) {
    const span = Math.max(1, Math.abs(minimum) * 0.1);
    return [minimum - span, maximum + span];
  }
  const padding = (maximum - minimum) * 0.1;
  return [minimum - padding, maximum + padding];
}

export function validateSynchronizedPanels(panels: readonly SynchronizedPanel[]) {
  const errors: string[] = [];
  if (panels.length < 2 || panels.length > 4) errors.push("Synchronized small multiples require 2 to 4 panels.");
  const ids = new Set<string>();
  const referenceLabels = panels[0]?.data.map(({ label }) => label) ?? [];
  panels.forEach((panel, panelIndex) => {
    if (!panel.id.trim() || ids.has(panel.id.trim())) errors.push(`Panel ${panelIndex} requires a unique non-empty id.`);
    ids.add(panel.id.trim());
    if (!panel.title.trim()) errors.push(`Panel ${panelIndex} requires a title.`);
    if (!panel.unit.trim()) errors.push(`Panel ${panelIndex} requires a unit.`);
    if (panel.data.length !== referenceLabels.length || panel.data.some(({ label }, index) => label !== referenceLabels[index])) errors.push(`Panel ${panelIndex} must use the same ordered labels as panel 0.`);
    const labels = new Set<string>();
    panel.data.forEach((datum, index) => {
      const label = datum.label.trim();
      if (!label || labels.has(label)) errors.push(`Panel ${panelIndex} datum ${index} requires a unique non-empty label.`);
      labels.add(label);
      if (datum.value !== null && (typeof datum.value !== "number" || !Number.isFinite(datum.value))) errors.push(`Panel ${panelIndex} datum ${index} contains a non-finite value.`);
    });
  });
  return { valid: errors.length === 0, errors } as const;
}

export function buildSynchronizedGeometry(panels: readonly SynchronizedPanel[]): readonly SynchronizedGeometryPanel[] {
  return panels.map((panel) => {
    let latest = -1;
    for (let index = panel.data.length - 1; index >= 0; index--) if (panel.data[index].value !== null) { latest = index; break; }
    return {
      id: panel.id,
      title: panel.title,
      unit: panel.unit,
      domain: getSynchronizedPanelDomain(panel),
      data: panel.data.map((datum, index) => ({ ...datum, index, missing: datum.value === null, latestValid: index === latest })),
    };
  });
}

export const mapSynchronizedX = (index: number, count: number, range: readonly [number, number]) => count <= 1 ? (range[0] + range[1]) / 2 : range[0] + (index / (count - 1)) * (range[1] - range[0]);
