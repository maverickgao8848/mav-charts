import type { VisualSystemId } from "@mav-charts/themes";
export const getIndexedEventMotion = (
  _system: VisualSystemId,
  animate: boolean,
) => ({
  isAnimationActive: animate,
  animationDuration: animate ? 850 : 0,
  animationEasing: "ease-out" as const,
});
