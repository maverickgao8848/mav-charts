import type { VisualSystemId } from "@mav-charts/themes";

export function getLabelledDonutMotion(system: VisualSystemId, enabled: boolean) {
  const duration = system === "signal" ? 720 : system === "editorial" ? 620 : 520;
  return { enabled, duration: enabled ? duration : 0, easing: "ease-out", initialOpacity: enabled ? 0 : 1 } as const;
}
