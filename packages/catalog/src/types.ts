import type { VisualSystemId } from "@mav-charts/themes";

export type ChartId =
  | `C${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11"}`
  | `T${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08" | "09" | "10" | "11" | "12" | "13"}`
  | `P${"01" | "02" | "03" | "04" | "05"}`
  | `D${"01" | "02" | "03" | "04" | "05" | "06" | "07" | "08"}`
  | `F${"01" | "02" | "03" | "04" | "05" | "06"}`
  | `B${"01" | "02" | "03" | "04" | "05"}`;
export type ChartQuestion = "compare" | "trend" | "composition" | "distribution" | "relationship" | "flow" | "progress";
export type ChartAudience = "consulting" | "finance" | "product" | "marketing" | "operations";
export type ChartScenario = "report" | "dashboard" | "web" | "video";
export type ChartStatus = "planned" | "prototype" | "stable";

export type ChartCatalogItem = {
  id: ChartId;
  slug: string;
  name: string;
  nameZh: string;
  description: string;
  descriptionZh: string;
  questions: readonly ChartQuestion[];
  audiences: readonly ChartAudience[];
  scenarios: readonly ChartScenario[];
  visualSystems: readonly VisualSystemId[];
  engine: "recharts";
  primitive: readonly string[];
  githubPath: string;
  rechartsReferences: readonly string[];
  status: ChartStatus;
};
