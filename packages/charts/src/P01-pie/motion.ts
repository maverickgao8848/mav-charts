import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getPieMotion(visualSystem: VisualSystemId, animate: boolean, index = 0) {
  const tokens = motionSystems[visualSystem];
  return {
    enabled: animate,
    initialOpacity: animate ? 0 : 1,
    duration: animate ? tokens.enterDurationMs : 0,
    delay: animate ? index * tokens.staggerMs : 0,
    easing: "ease-out" as const,
  };
}

