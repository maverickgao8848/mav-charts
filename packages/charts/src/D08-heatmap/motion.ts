import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getHeatmapCellMotion(visualSystem: VisualSystemId, animate: boolean, index: number) {
  const tokens = motionSystems[visualSystem];
  return { durationMs: animate ? tokens.enterDurationMs : 0, delayMs: animate ? Math.min(index, 24) * Math.max(12, Math.round(tokens.staggerMs / 4)) : 0, animate } as const;
}

