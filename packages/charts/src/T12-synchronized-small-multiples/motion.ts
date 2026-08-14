import type { VisualSystemId } from "@mav-charts/themes";
const durations: Record<VisualSystemId, number> = { signal: 680, editorial: 820, digital: 940 };
export const getSynchronizedSmallMultiplesMotion = (system: VisualSystemId, enabled: boolean, panelIndex = 0) => ({ isAnimationActive: enabled, animationDuration: durations[system], animationBegin: panelIndex * 70, animationEasing: "ease-out" as const });
