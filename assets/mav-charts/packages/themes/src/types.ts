export type VisualSystemId = "signal" | "editorial" | "digital";

export type VisualSystemTokens = {
  index: string;
  key: VisualSystemId;
  eyebrow: string;
  name: string;
  descriptor: string;
  tags: readonly [string, string, string];
  background: string;
  surface: string;
  surfaceAlt: string;
  text: string;
  muted: string;
  grid: string;
  primary: string;
  secondary: string;
  tertiary: string;
  fourth: string;
  display: string;
  body: string;
  mono: string;
  radius: { container: number; mark: number; pill: number };
  line: { hairline: number; grid: number; data: number; emphasis: number };
  label: { fontSize: number; fontWeight: number; letterSpacing: string; uppercase: boolean };
  tooltip: { radius: number; borderWidth: number; padding: string };
  legend: { fontSize: number; iconSize: number; gap: number };
  chart: { gridDash: string; inactiveOpacity: number };
};
