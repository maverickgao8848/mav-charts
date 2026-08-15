import type { VisualSystemId } from "@mav-charts/themes"; const durations: Record<VisualSystemId, number> = { signal: 620, editorial: 740, digital: 840 }; export const getOhlcMotion = (system: VisualSystemId, enabled: boolean) => ({ isAnimationActive: enabled, animationDuration: durations[system], animationEasing: "ease-out" as const });

