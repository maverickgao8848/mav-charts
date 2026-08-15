import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getColumnTargetMotion(
  visualSystem: VisualSystemId,
  animate: boolean,
  index = 0,
) {
  const tokens = motionSystems[visualSystem];
  return {
    bar: {
      isAnimationActive: animate,
      animationDuration: animate ? tokens.enterDurationMs : 0,
      animationEasing: "ease-out" as const,
    },
    marker: {
      enabled: animate,
      duration: animate ? tokens.enterDurationMs : 0,
      delay: animate ? index * tokens.staggerMs : 0,
      initialOpacity: animate ? 0 : 1,
    },
  } as const;
}
