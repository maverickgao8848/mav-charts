import type { VisualSystemId } from "@mav-charts/themes";
const durations: Record<VisualSystemId, number> = {
  signal: 700,
  editorial: 800,
  digital: 900,
};
export const getRadarProfileMotion = (
  system: VisualSystemId,
  enabled: boolean,
  delay = 0,
) => ({
  isAnimationActive: enabled,
  animationDuration: durations[system],
  animationBegin: enabled ? delay : 0,
  animationEasing: "ease-out" as const,
});
