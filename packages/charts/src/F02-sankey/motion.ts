import type { VisualSystemId } from "@mav-charts/themes";

export function getSankeyMotion(
  system: VisualSystemId,
  animate: boolean,
  index = 0,
) {
  const durationMs =
    system === "signal" ? 620 : system === "editorial" ? 760 : 680;
  return {
    animate,
    durationMs,
    delayMs: index * (system === "signal" ? 45 : 60),
  } as const;
}
