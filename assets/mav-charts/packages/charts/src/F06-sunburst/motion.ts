import type { VisualSystemId } from "@mav-charts/themes";
const durations: Record<VisualSystemId, number> = { signal: 720, editorial: 820, digital: 920 };
export const getSunburstMotion = (system: VisualSystemId, enabled: boolean) => ({ enabled, durationMs: enabled ? durations[system] : 0, animationName: enabled ? `mav-sunburst-${system}` : "none" });

