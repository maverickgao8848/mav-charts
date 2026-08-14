import type { ReactNode } from "react";
import type { VisualSystemId, VisualSystemTokens } from "@mav-charts/themes";

export type ChartViewport = "wide" | "standard" | "card" | "mobile";

export type ChartDataState = "ready" | "empty" | "invalid";

export type ChartRenderContext = {
  theme: VisualSystemTokens;
  visualSystem: VisualSystemId;
  viewport: ChartViewport;
  animate: boolean;
};

export type ChartShellProps = {
  code: string;
  title: string;
  subtitle: string;
  source: string;
  theme: VisualSystemTokens;
  children: ReactNode;
  description?: string;
  state?: ChartDataState;
};
