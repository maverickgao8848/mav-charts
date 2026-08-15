import type { VisualSystemId } from "@mav-charts/themes";
export function getDonutMotion(system: VisualSystemId, animate: boolean) {
  return {
    isAnimationActive: animate,
    animationBegin: system === "signal" ? 0 : 70,
    animationDuration:
      system === "signal" ? 620 : system === "editorial" ? 760 : 540,
    animationEasing: "ease-out" as const,
  };
}
