import type { VisualSystemId } from "@mav-charts/themes";
const durations: Record<VisualSystemId, number> = { signal: 650, editorial: 820, digital: 960 };
export const getQuadrantScatterMotion = (system: VisualSystemId, enabled: boolean) => ({ isAnimationActive: enabled, animationDuration: durations[system], animationEasing: "ease-out" as const });
