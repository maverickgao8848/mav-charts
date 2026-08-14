import type { VisualSystemId } from "@mav-charts/themes";
const durations: Record<VisualSystemId, number> = { signal: 700, editorial: 800, digital: 900 };
export const getNestedTreemapMotion = (system: VisualSystemId, enabled: boolean) => ({ isAnimationActive: enabled, animationDuration: durations[system], animationEasing: "ease-out" as const });

