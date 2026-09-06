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

export type ChartMotionSpec = {
  enterMs: number;
  holdMs: number;
  exitMs: number;
  defaultSceneMs: number;
  minSceneMs: number;
  maxSceneMs: number;
};

export type ChartMotionProps = { animate?: boolean; durationMs?: number; progress?: number };
export type ResolvedMotionFrame = {
  sceneProgress: number; elapsedMs: number; enterProgress: number; holdProgress: number; exitProgress: number;
  phase: "enter" | "hold" | "exit" | "complete";
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

export function resolveMotionFrame(spec: ChartMotionSpec, input: { durationMs?: number; progress?: number } = {}): ResolvedMotionFrame {
  const total = spec.enterMs + spec.holdMs + spec.exitMs;
  const durationMs = Number.isFinite(input.durationMs) && (input.durationMs as number) >= 0 ? input.durationMs as number : spec.defaultSceneMs;
  const sceneProgress = Number.isFinite(input.progress) ? clamp01(input.progress as number) : 0;
  const elapsedMs = sceneProgress * durationMs;
  if (sceneProgress >= 1 || total <= 0 || durationMs <= 0) return { sceneProgress, elapsedMs, enterProgress: 1, holdProgress: 1, exitProgress: 1, phase: "complete" };
  const enter = durationMs * spec.enterMs / total;
  const hold = durationMs * spec.holdMs / total;
  if (elapsedMs < enter) return { sceneProgress, elapsedMs, enterProgress: clamp01(elapsedMs / enter), holdProgress: 0, exitProgress: 0, phase: "enter" };
  if (elapsedMs < enter + hold) return { sceneProgress, elapsedMs, enterProgress: 1, holdProgress: clamp01((elapsedMs - enter) / hold), exitProgress: 0, phase: "hold" };
  return { sceneProgress, elapsedMs, enterProgress: 1, holdProgress: 1, exitProgress: clamp01((elapsedMs - enter - hold) / (durationMs - enter - hold)), phase: "exit" };
}

export const easeOutCubic = (progress: number) => 1 - Math.pow(1 - clamp01(progress), 3);
export const easeInOutCubic = (progress: number) => progress < 0.5 ? 4 * Math.pow(clamp01(progress), 3) : 1 - Math.pow(-2 * clamp01(progress) + 2, 3) / 2;
