import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getDualAxisMotion(visualSystem: VisualSystemId, animate: boolean) {
  const tokens = motionSystems[visualSystem];
  return {
    bar: { isAnimationActive: animate, animationDuration: animate ? tokens.enterDurationMs : 0, animationEasing: "ease-out" as const },
    line: { isAnimationActive: animate, animationDuration: animate ? tokens.enterDurationMs + tokens.staggerMs * 2 : 0, animationEasing: "ease-out" as const },
  } as const;
}

