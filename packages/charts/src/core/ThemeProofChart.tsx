import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { getVisualSystem, type VisualSystemId } from "@mav-charts/themes";
import { ChartShell } from "./ChartShell";

export type ThemeProofDatum = {
  label: string;
  value: number;
};

export type ThemeProofChartProps = {
  data: readonly ThemeProofDatum[];
  visualSystem: VisualSystemId;
};

function geometrySignature(data: readonly ThemeProofDatum[]): string {
  return data.map(({ label, value }) => `${label}:${value}`).join("|");
}

export function ThemeProofChart({ data, visualSystem }: ThemeProofChartProps) {
  const theme = getVisualSystem(visualSystem);

  return (
    <div data-geometry-signature={geometrySignature(data)}>
      <ChartShell
        code="A00"
        title="One geometry, three systems"
        subtitle="PHASE A TOKEN PROOF"
        source="MAV CHARTS · FOUNDATION"
        theme={theme}
        description="A deterministic comparison used to prove visual-system switching."
        state={data.length ? "ready" : "empty"}
      >
        <BarChart width={560} height={360} data={[...data]} accessibilityLayer>
          <CartesianGrid vertical={false} stroke={theme.grid} strokeDasharray={theme.chart.gridDash} />
          <XAxis dataKey="label" stroke={theme.muted} tickLine={false} axisLine={false} />
          <YAxis stroke={theme.muted} tickLine={false} axisLine={false} />
          <Bar
            dataKey="value"
            fill={theme.primary}
            radius={[theme.radius.mark, theme.radius.mark, 0, 0]}
            isAnimationActive={false}
          />
        </BarChart>
      </ChartShell>
    </div>
  );
}
