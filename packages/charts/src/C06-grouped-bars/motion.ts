import type { VisualSystemId } from "@mav-charts/themes";

const durations: Record<VisualSystemId, number> = { signal: 620, editorial: 760, digital: 900 };
export const getGroupedBarMotion = (system: VisualSystemId, enabled: boolean, seriesIndex = 0) => ({
  isAnimationActive: enabled,
  animationDuration: durations[system],
  animationBegin: seriesIndex * 90,
  animationEasing: "ease-out" as const,
});
