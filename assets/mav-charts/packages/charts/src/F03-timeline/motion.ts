import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getTimelineItemMotion(visualSystem: VisualSystemId, animate: boolean, index: number) {
  const tokens = motionSystems[visualSystem];
  return { durationMs: animate ? tokens.enterDurationMs : 0, delayMs: animate ? index * tokens.staggerMs : 0, animate } as const;
}

