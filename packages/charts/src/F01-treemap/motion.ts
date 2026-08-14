import type { VisualSystemId } from "@mav-charts/themes";

const durations: Record<VisualSystemId, number> = { signal: 680, editorial: 780, digital: 880 };
export const getTreemapMotion = (system: VisualSystemId, enabled: boolean) => ({
  isAnimationActive: enabled,
  animationDuration: durations[system],
  animationEasing: "ease-out" as const,
});

