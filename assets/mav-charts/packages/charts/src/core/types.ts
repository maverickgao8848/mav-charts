import type { ReactNode } from "react";
import type { VisualSystemId, VisualSystemTokens } from "@mav-charts/themes";
import type { ChartMotionProps } from "@mav-charts/motion";

export type { ChartMotionProps } from "@mav-charts/motion";

export type ChartViewport = "wide" | "standard" | "card" | "mobile";

export type ChartDataState = "ready" | "empty" | "invalid";

export type ChartRenderContext = {
  theme: VisualSystemTokens;
  visualSystem: VisualSystemId;
  viewport: ChartViewport;
  animate: boolean;
};

export type MotionEnabledChartProps = ChartMotionProps;

export type ChartShellProps = ChartMotionProps & {
  code: string;
  title: string;
  subtitle: string;
  source: string;
  theme: VisualSystemTokens;
  children: ReactNode;
  description?: string;
  state?: ChartDataState;
};
