import type { VisualSystemId } from "@mav-charts/themes";

export type MotionTokens = {
  enterDurationMs: number;
  staggerMs: number;
  easing: string;
  emphasis: "lock" | "sweep" | "reveal";
};

export const motionSystems: Record<VisualSystemId, MotionTokens> = {
  signal: { enterDurationMs: 520, staggerMs: 55, easing: "cubic-bezier(.2,.8,.2,1)", emphasis: "lock" },
  editorial: { enterDurationMs: 720, staggerMs: 80, easing: "cubic-bezier(.16,1,.3,1)", emphasis: "sweep" },
  digital: { enterDurationMs: 1100, staggerMs: 110, easing: "cubic-bezier(.22,.61,.36,1)", emphasis: "reveal" },
};

export type MotionPreferences = {
  capture: boolean;
  reduced: boolean;
  animate: boolean;
};

export function resolveMotionPreferences(search = "", reduced = false): MotionPreferences {
  const capture = new URLSearchParams(search).has("capture");
  return { capture, reduced, animate: !capture && !reduced };
}
