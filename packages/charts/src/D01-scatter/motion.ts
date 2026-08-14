import type { VisualSystemId } from "@mav-charts/themes";
export const getScatterMotion = (
  _system: VisualSystemId,
  animate: boolean,
) => ({
  isAnimationActive: animate,
  animationDuration: animate ? 750 : 0,
  animationEasing: "ease-out" as const,
});
