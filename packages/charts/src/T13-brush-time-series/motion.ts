import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getBrushTimeSeriesMotion(visualSystem: VisualSystemId, animate: boolean) {
  const tokens = motionSystems[visualSystem];
  return {
    isAnimationActive: animate,
    animationDuration: animate ? tokens.enterDurationMs : 0,
    animationEasing: "ease-out" as const,
  };
}

