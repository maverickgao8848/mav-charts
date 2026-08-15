import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getFunnelMotion(visualSystem: VisualSystemId, animate: boolean, index = 0) {
  const tokens = motionSystems[visualSystem];
  return {
    enabled: animate,
    duration: animate ? tokens.enterDurationMs : 0,
    delay: animate ? index * tokens.staggerMs : 0,
    initialOpacity: animate ? 0 : 1,
  } as const;
}

