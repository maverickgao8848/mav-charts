import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getDumbbellMotion(visualSystem: VisualSystemId, animate: boolean, index: number) {
  const tokens = motionSystems[visualSystem];
  return {
    enabled: animate,
    initialOpacity: animate ? 0 : 1,
    durationMs: tokens.enterDurationMs,
    delayMs: index * tokens.staggerMs,
  } as const;
}
