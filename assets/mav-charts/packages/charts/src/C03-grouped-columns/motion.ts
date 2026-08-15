import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getGroupedColumnMotion(visualSystem: VisualSystemId, animate: boolean, seriesIndex = 0) {
  const tokens = motionSystems[visualSystem];
  return {
    isAnimationActive: animate,
    animationBegin: animate ? seriesIndex * Math.round(tokens.enterDurationMs * 0.12) : 0,
    animationDuration: animate ? tokens.enterDurationMs : 0,
    animationEasing: "ease-out" as const,
  };
}
