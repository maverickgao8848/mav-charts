import type { VisualSystemId } from "@mav-charts/themes";
const durations: Record<VisualSystemId, number> = { signal: 640, editorial: 780, digital: 900 };
export const getBoxPlotMotion = (system: VisualSystemId, enabled: boolean, index = 0) => ({ enabled, duration: enabled ? durations[system] : 0, delay: enabled ? index * 65 : 0, initialOpacity: enabled ? 0 : 1 });
