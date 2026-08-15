import { motionSystems } from "@mav-charts/motion";
import type { VisualSystemId } from "@mav-charts/themes";

export function getNeedleGaugeMotion(visualSystem: VisualSystemId, animate: boolean) {
  const tokens = motionSystems[visualSystem];
  return { enabled: animate, duration: animate ? tokens.enterDurationMs : 0, easing: "ease-out" as const };
}

