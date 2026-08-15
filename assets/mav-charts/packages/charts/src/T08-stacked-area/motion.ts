import type { VisualSystemId } from "@mav-charts/themes";
const durations: Record<VisualSystemId, number> = {
  signal: 700,
  editorial: 850,
  digital: 980,
};
export const getStackedAreaMotion = (
  system: VisualSystemId,
  enabled: boolean,
  series: number,
) => ({
  isAnimationActive: enabled,
  animationDuration: durations[system] + series * 120,
  animationBegin: series * 90,
  animationEasing: "ease-out" as const,
});
