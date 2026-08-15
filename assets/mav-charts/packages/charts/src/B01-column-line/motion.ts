import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getColumnLineMotion(
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
    line: {
      isAnimationActive: animate,
      animationDuration: animate
        ? tokens.enterDurationMs + tokens.staggerMs * 2
        : 0,
      animationEasing: "ease-out" as const,
    },
    entry: {
      enabled: animate,
      duration: animate ? tokens.enterDurationMs : 0,
      delay: animate ? index * tokens.staggerMs : 0,
      initialOpacity: animate ? 0 : 1,
    },
  } as const;
}
