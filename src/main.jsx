import React from "react";
import { createRoot } from "react-dom/client";
import {
  Area,
  AreaChart,
  Bar,
  Brush,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  LabelList,
  Line,
  PolarAngleAxis,
  RadialBar,
  RadialBarChart,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";
import {
  BrushTimeSeriesChart as FormalBrushTimeSeriesChart,
  BrushTimeSeriesGeometry,
  BubbleQuadrantChart as FormalBubbleQuadrantChart,
  BubbleQuadrantGeometry,
  ChartShell,
  DivergingBarChart as FormalDivergingBarChart,
  DualAxisChart as FormalDualAxisChart,
  DualAxisGeometry,
  DumbbellChart as FormalDumbbellChart,
  DumbbellGeometry,
  GroupedBarChart as FormalGroupedBarChart,
  GroupedColumnChart as FormalGroupedColumnChart,
  HeatmapChart as FormalHeatmapChart,
  HeatmapGeometry,
  HorizontalRankingChart as FormalHorizontalRankingChart,
  PercentStackedChart as FormalPercentStackedChart,
  ProfitBridgeChart,
  ProfitBridgeGeometry,
  RadialProgressChart as FormalRadialProgressChart,
  RadialProgressGeometry,
  PieCompositionChart as FormalPieCompositionChart,
  NeedleGaugeChart as FormalNeedleGaugeChart,
  DonutChart as FormalDonutChart,
  LabelledDonutChart as FormalLabelledDonutChart,
  RangeAreaChart as FormalRangeAreaChart,
  RangeAreaGeometry,
  RoundedColumnChart as FormalRoundedColumnChart,
  SimpleColumnChart as FormalSimpleColumnChart,
  StackedBarChart as FormalStackedBarChart,
  StackedColumnChart as FormalStackedColumnChart,
  TimelineChart as FormalTimelineChart,
  TimelineGeometry,
  TrendLineChart as FormalTrendLineChart,
  brushTimeSeriesEdgeCases,
  brushTimeSeriesExample,
  bubbleQuadrantEdgeCases,
  bubbleQuadrantExample,
  divergingBarEdgeCases,
  divergingBarExample,
  dualAxisEdgeCases,
  dualAxisExample,
  dumbbellEdgeCases,
  dumbbellExample,
  groupedBarEdgeCases,
  groupedBarExample,
  groupedColumnEdgeCases,
  groupedColumnExample,
  heatmapEdgeCases,
  heatmapExample,
  horizontalRankingEdgeCases,
  horizontalRankingExample,
  percentStackedEdgeCases,
  percentStackedExample,
  profitBridgeEdgeCases,
  profitBridgeExample,
  radialProgressEdgeCases,
  radialProgressExample,
  pieEdgeCases,
  pieExample,
  needleGaugeEdgeCases,
  needleGaugeExample,
  donutEdgeCases,
  donutExample,
  labelledDonutEdgeCases,
  labelledDonutExample,
  rangeAreaEdgeCases,
  rangeAreaExample,
  roundedColumnEdgeCases,
  roundedColumnExample,
  simpleColumnEdgeCases,
  simpleColumnExample,
  stackedBarEdgeCases,
  stackedBarExample,
  stackedColumnEdgeCases,
  stackedColumnExample,
  timelineEdgeCases,
  timelineExample,
  trendLineEdgeCases,
  trendLineExample,
} from "../packages/charts/src";
import {
  MultiSeriesLineChart as FormalMultiSeriesLineChart,
  multiSeriesLineEdgeCases,
  multiSeriesLineExample,
} from "../packages/charts/src/T02-multi-series-line";
import {
  StepLineChart as FormalStepLineChart,
  stepLineEdgeCases,
  stepLineExample,
} from "../packages/charts/src/T03-step-line";
import {
  ValueDotLineChart as FormalValueDotLineChart,
  valueDotLineEdgeCases,
  valueDotLineExample,
} from "../packages/charts/src/T04-value-dot-line";
import {
  TargetLineChart as FormalTargetLineChart,
  targetLineEdgeCases,
  targetLineExample,
} from "../packages/charts/src/T05-target-line";
import {
  TrendAreaChart as FormalTrendAreaChart,
  trendAreaEdgeCases,
  trendAreaExample,
} from "../packages/charts/src/T06-trend-area";
import {
  MultiSeriesAreaChart as FormalMultiSeriesAreaChart,
  multiSeriesAreaEdgeCases,
  multiSeriesAreaExample,
} from "../packages/charts/src/T07-multi-series-area";
import {
  StackedAreaChart as FormalStackedAreaChart,
  stackedAreaEdgeCases,
  stackedAreaExample,
} from "../packages/charts/src/T08-stacked-area";
import {
  IndexedEventTrendChart as FormalIndexedEventTrendChart,
  indexedEventEdgeCases,
  indexedEventExample,
} from "../packages/charts/src/T10-indexed-event-trend";
import {
  PercentAreaChart as FormalPercentAreaChart,
  percentAreaEdgeCases,
  percentAreaExample,
} from "../packages/charts/src/T11-percent-area";
import {
  SynchronizedSmallMultiplesChart as FormalSynchronizedSmallMultiplesChart,
  synchronizedSmallMultiplesEdgeCases,
  synchronizedSmallMultiplesExample,
} from "../packages/charts/src/T12-synchronized-small-multiples";
import {
  ScatterChartTemplate as FormalScatterChart,
  scatterEdgeCases,
  scatterExample,
} from "../packages/charts/src/D01-scatter";
import {
  QuadrantScatterChart as FormalQuadrantScatterChart,
  quadrantScatterEdgeCases,
  quadrantScatterExample,
} from "../packages/charts/src/D02-quadrant-scatter";
import {
  BoxPlotChart as FormalBoxPlotChart,
  boxPlotEdgeCases,
  boxPlotExample,
} from "../packages/charts/src/D04-box-plot";
import {
  ErrorBarChart as FormalErrorBarChart,
  errorBarEdgeCases,
  errorBarExample,
} from "../packages/charts/src/D06-error-bar";
import {
  HistogramChart as FormalHistogramChart,
  histogramEdgeCases,
  histogramExample,
} from "../packages/charts/src/D07-histogram";
import {
  RegressionChart as FormalRegressionChart,
  regressionEdgeCases,
  regressionExample,
} from "../packages/charts/src/D05-regression";
import {
  TreemapChart as FormalTreemapChart,
  treemapEdgeCases,
  treemapExample,
} from "../packages/charts/src/F01-treemap";
import {
  SankeyChart as FormalSankeyChart,
  sankeyEdgeCases,
  sankeyExample,
} from "../packages/charts/src/F02-sankey";
import {
  FunnelStageChart as FormalFunnelStageChart,
  funnelEdgeCases,
  funnelExample,
} from "../packages/charts/src/F04-funnel";
import {
  NestedTreemapChart as FormalNestedTreemapChart,
  nestedTreemapEdgeCases,
  nestedTreemapExample,
} from "../packages/charts/src/F05-nested-treemap";
import {
  SunburstHierarchyChart as FormalSunburstChart,
  sunburstEdgeCases,
  sunburstExample,
} from "../packages/charts/src/F06-sunburst";
import {
  ColumnLineChart as FormalColumnLineChart,
  columnLineEdgeCases,
  columnLineExample,
} from "../packages/charts/src/B01-column-line";
import {
  ColumnTargetChart as FormalColumnTargetChart,
  columnTargetEdgeCases,
  columnTargetExample,
} from "../packages/charts/src/B02-column-target";
import {
  RadarProfileChart as FormalRadarProfileChart,
  radarProfileEdgeCases,
  radarProfileExample,
} from "../packages/charts/src/B04-radar-profile";
import {
  OhlcCandlestickChart as FormalOhlcCandlestickChart,
  ohlcEdgeCases,
  ohlcExample,
} from "../packages/charts/src/B05-ohlc-candlestick";
import { resolveMotionPreferences } from "../packages/motion/src";
import { visualSystemIds, visualSystems } from "../packages/themes/src";
import "./styles.css";

const motionPreferences = resolveMotionPreferences(
  window.location.search,
  window.matchMedia("(prefers-reduced-motion: reduce)").matches,
);
const captureMode = !motionPreferences.animate;
document.documentElement.dataset.capture = captureMode ? "true" : "false";

const themes = visualSystems;

const tooltipStyle = (theme) => ({
  background: theme.surfaceAlt,
  border: `${theme.tooltip.borderWidth}px solid ${theme.grid}`,
  borderRadius: theme.tooltip.radius,
  color: theme.text,
  fontSize: theme.label.fontSize,
  padding: theme.tooltip.padding,
});

const axis = (theme) => ({
  tick: {
    fill: theme.muted,
    fontSize: theme.label.fontSize,
    fontWeight: theme.label.fontWeight,
  },
  axisLine: false,
  tickLine: false,
});

function ChartCard({ code, title, subtitle, source, theme, children }) {
  return (
    <ChartShell
      code={code}
      title={title}
      subtitle={subtitle}
      source={source}
      theme={theme}
    >
      {children}
    </ChartShell>
  );
}

function WaterfallChart({ theme }) {
  return (
    <ProfitBridgeGeometry
      data={profitBridgeExample}
      theme={theme}
      animate={!captureMode}
    />
  );
}

function BubbleChart({ theme }) {
  return (
    <BubbleQuadrantGeometry
      data={bubbleQuadrantExample}
      theme={theme}
      animate={!captureMode}
    />
  );
}

function DualAxisChart({ theme }) {
  return (
    <DualAxisGeometry
      data={dualAxisExample}
      theme={theme}
      animate={!captureMode}
    />
  );
}

function DumbbellChart({ theme }) {
  return (
    <DumbbellGeometry
      data={dumbbellExample}
      theme={theme}
      animate={!captureMode}
    />
  );
}

function RangeAreaChart({ theme }) {
  return (
    <RangeAreaGeometry
      data={rangeAreaExample}
      theme={theme}
      animate={!captureMode}
    />
  );
}

function TimelineChart({ theme }) {
  return (
    <TimelineGeometry
      data={timelineExample}
      theme={theme}
      animate={!captureMode}
    />
  );
}

function BrushTimeSeries({ theme }) {
  return (
    <BrushTimeSeriesGeometry
      data={brushTimeSeriesExample}
      theme={theme}
      animate={!captureMode}
    />
  );
}

function HeatmapChart({ theme }) {
  return (
    <HeatmapGeometry
      data={heatmapExample}
      theme={theme}
      animate={!captureMode}
    />
  );
}

function RadialProgressChart({ theme }) {
  return (
    <RadialProgressGeometry
      data={radialProgressExample}
      theme={theme}
      animate={!captureMode}
    />
  );
}

const boards = {
  signal: [
    {
      code: "R25",
      title: "Margin recovery did the heavy lifting",
      subtitle: "EBITDA BRIDGE · INDEXED TO 100",
      source: "MAV SIGNAL · YING WATERFALL BRIDGE",
      chart: WaterfallChart,
    },
    {
      code: "R28",
      title: "Two challengers escaped the price trap",
      subtitle: "PRICE INDEX × GROWTH · BUBBLE = SHARE",
      source: "MAV SIGNAL · YING BUBBLE QUADRANT",
      chart: BubbleChart,
    },
    {
      code: "R26",
      title: "Growth held while margin reset",
      subtitle: "REVENUE $M · MARGIN % · H1",
      source: "MAV SIGNAL · YING DUAL AXIS",
      chart: DualAxisChart,
    },
  ],
  editorial: [
    {
      code: "M//01",
      title: "Every region moved—just not together",
      subtitle: "2024 → 2026 · INDEXED PERFORMANCE",
      source: "MAV EDITORIAL · ENGINEERED DUMBBELL",
      chart: DumbbellChart,
    },
    {
      code: "M//02",
      title: "The upside widened after April",
      subtitle: "MEDIAN + 80% CONFIDENCE RANGE",
      source: "MAV EDITORIAL · PERFORMANCE ENVELOPE",
      chart: RangeAreaChart,
    },
    {
      code: "M//03",
      title: "Scale arrived before the market was ready",
      subtitle: "POLICY · CAPACITY · EXPORT MILESTONES",
      source: "MAV EDITORIAL · VELOCITY TIMELINE",
      chart: TimelineChart,
    },
  ],
  digital: [
    {
      code: "SYS.01",
      title: "Traffic accelerated without a latency tax",
      subtitle: "REQUESTS / MIN · LIVE 24H WINDOW",
      source: "MAV DIGITAL · OBSERVATION TRACE",
      chart: BrushTimeSeries,
    },
    {
      code: "SYS.02",
      title: "Wednesday noon is the pressure point",
      subtitle: "ACTIVITY DENSITY · DAY × HOUR",
      source: "MAV DIGITAL · DENSITY MATRIX",
      chart: HeatmapChart,
    },
    {
      code: "SYS.03",
      title: "Activation leads; expansion still lags",
      subtitle: "PRODUCT HEALTH · CURRENT COHORT",
      source: "MAV DIGITAL · COHORT STATE",
      chart: RadialProgressChart,
    },
  ],
};

function Board({ themeKey }) {
  const theme = themes[themeKey];
  return (
    <section
      className={`visual-board board-${themeKey}`}
      id={`board-${themeKey}`}
      data-board={themeKey}
      style={{
        "--board-bg": theme.background,
        "--surface": theme.surface,
        "--surface-alt": theme.surfaceAlt,
        "--text": theme.text,
        "--muted": theme.muted,
        "--grid": theme.grid,
        "--primary": theme.primary,
        "--secondary": theme.secondary,
        "--tertiary": theme.tertiary,
        "--display": theme.display,
      }}
    >
      <div className="board-glow" />
      <div className="theme-ornament" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
      <div className="board-ghost-index" aria-hidden="true">
        {theme.index.slice(0, 2)}
      </div>
      <header className="board-header">
        <div className="brand-lockup">
          <div className="mav-mark">
            <span>M</span>
            <span>A</span>
            <span>V</span>
          </div>
          <div>
            <strong>MAV CHARTS</strong>
            <small>VISUAL SYSTEM STUDY</small>
          </div>
        </div>
        <div className="board-title">
          <span>{theme.eyebrow}</span>
          <h1>{theme.name}</h1>
          <p>{theme.descriptor}</p>
        </div>
        <div className="board-meta">
          <strong>{theme.index}</strong>
          <div>
            {theme.tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
        </div>
      </header>
      <div className="chart-grid">
        {boards[themeKey].map((item) => {
          const Chart = item.chart;
          return (
            <ChartCard key={item.code} {...item} theme={theme}>
              <Chart theme={theme} />
            </ChartCard>
          );
        })}
      </div>
    </section>
  );
}

function App() {
  const params = new URLSearchParams(window.location.search);
  const previewTheme = params.get("theme");
  if (params.get("template") === "B05") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: ohlcEdgeCases.empty,
      single: ohlcEdgeCases.single,
      missing: ohlcEdgeCases.missing,
      "partial-missing": ohlcEdgeCases.partialMissing,
      "up-down-flat": ohlcEdgeCases.upDownFlat,
      negative: ohlcEdgeCases.negative,
      constant: ohlcEdgeCases.constant,
      extreme: ohlcEdgeCases.extreme,
      "long-label": ohlcEdgeCases.longLabel,
      "invalid-low": ohlcEdgeCases.invalidLow,
      "invalid-high": ohlcEdgeCases.invalidHigh,
      invalid: ohlcEdgeCases.invalid,
      duplicate: ohlcEdgeCases.duplicate,
      nonfinite: ohlcEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? ohlcExample;
    return (
      <main className="template-preview" data-template-preview="B05">
        <FormalOhlcCandlestickChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "B04") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: radarProfileEdgeCases.empty,
      single: radarProfileEdgeCases.single,
      "two-axes": radarProfileEdgeCases.twoAxes,
      "missing-primary": radarProfileEdgeCases.missingPrimary,
      "missing-comparison": radarProfileEdgeCases.missingComparison,
      "missing-both": radarProfileEdgeCases.missingBoth,
      zero: radarProfileEdgeCases.zero,
      boundaries: radarProfileEdgeCases.boundaries,
      constant: radarProfileEdgeCases.constant,
      "long-label": radarProfileEdgeCases.longLabel,
      negative: radarProfileEdgeCases.negative,
      "over-100": radarProfileEdgeCases.over100,
      invalid: radarProfileEdgeCases.invalid,
      duplicate: radarProfileEdgeCases.duplicate,
      nonfinite: radarProfileEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? radarProfileExample;
    return (
      <main className="template-preview" data-template-preview="B04">
        <FormalRadarProfileChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "B02") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: columnTargetEdgeCases.empty,
      single: columnTargetEdgeCases.single,
      "missing-actual": columnTargetEdgeCases.missingActual,
      "missing-target": columnTargetEdgeCases.missingTarget,
      "missing-both": columnTargetEdgeCases.missingBoth,
      signed: columnTargetEdgeCases.signed,
      "all-negative": columnTargetEdgeCases.allNegative,
      zero: columnTargetEdgeCases.zero,
      equal: columnTargetEdgeCases.equal,
      ties: columnTargetEdgeCases.ties,
      "variable-targets": columnTargetEdgeCases.variableTargets,
      extreme: columnTargetEdgeCases.extreme,
      "long-label": columnTargetEdgeCases.longLabel,
      duplicate: columnTargetEdgeCases.duplicate,
      "nonfinite-actual": columnTargetEdgeCases.nonfiniteActual,
      "nonfinite-target": columnTargetEdgeCases.nonfiniteTarget,
      blank: columnTargetEdgeCases.blank,
    };
    const data = caseMap[previewCase] ?? columnTargetExample;
    return (
      <main className="template-preview" data-template-preview="B02">
        <FormalColumnTargetChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "F06") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: sunburstEdgeCases.empty,
      single: sunburstEdgeCases.single,
      missing: sunburstEdgeCases.missing,
      zero: sunburstEdgeCases.zero,
      "all-zero": sunburstEdgeCases.allZero,
      deep: sunburstEdgeCases.deep,
      extreme: sunburstEdgeCases.extreme,
      "long-label": sunburstEdgeCases.longLabel,
      many: sunburstEdgeCases.many,
      unbalanced: sunburstEdgeCases.unbalanced,
      negative: sunburstEdgeCases.negative,
      "invalid-depth": sunburstEdgeCases.invalidDepth,
      blank: sunburstEdgeCases.blank,
      duplicate: sunburstEdgeCases.duplicate,
      nonfinite: sunburstEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? sunburstExample;
    return (
      <main className="template-preview" data-template-preview="F06">
        <FormalSunburstChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "B01") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: columnLineEdgeCases.empty,
      single: columnLineEdgeCases.single,
      "missing-scale": columnLineEdgeCases.missingScale,
      "missing-rate": columnLineEdgeCases.missingRate,
      "missing-both": columnLineEdgeCases.missingBoth,
      "negative-scale": columnLineEdgeCases.negativeScale,
      "all-negative-scale": columnLineEdgeCases.allNegativeScale,
      zero: columnLineEdgeCases.zero,
      extreme: columnLineEdgeCases.extreme,
      "long-label": columnLineEdgeCases.longLabel,
      flat: columnLineEdgeCases.flat,
      "rate-below": columnLineEdgeCases.rateBelow,
      "rate-above": columnLineEdgeCases.rateAbove,
      duplicate: columnLineEdgeCases.duplicate,
      "nonfinite-scale": columnLineEdgeCases.nonfiniteScale,
      "nonfinite-rate": columnLineEdgeCases.nonfiniteRate,
      blank: columnLineEdgeCases.blank,
    };
    const data = caseMap[previewCase] ?? columnLineExample;
    return (
      <main className="template-preview" data-template-preview="B01">
        <FormalColumnLineChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "F05") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: nestedTreemapEdgeCases.empty,
      single: nestedTreemapEdgeCases.single,
      missing: nestedTreemapEdgeCases.missing,
      zero: nestedTreemapEdgeCases.zero,
      "all-zero": nestedTreemapEdgeCases.allZero,
      deep: nestedTreemapEdgeCases.deep,
      extreme: nestedTreemapEdgeCases.extreme,
      "long-label": nestedTreemapEdgeCases.longLabel,
      many: nestedTreemapEdgeCases.many,
      unbalanced: nestedTreemapEdgeCases.unbalanced,
      negative: nestedTreemapEdgeCases.negative,
      "invalid-depth": nestedTreemapEdgeCases.invalidDepth,
      blank: nestedTreemapEdgeCases.blank,
      duplicate: nestedTreemapEdgeCases.duplicate,
      nonfinite: nestedTreemapEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? nestedTreemapExample;
    return (
      <main className="template-preview" data-template-preview="F05">
        <FormalNestedTreemapChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "F04") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: funnelEdgeCases.empty,
      single: funnelEdgeCases.single,
      missing: funnelEdgeCases.missing,
      zero: funnelEdgeCases.zero,
      flat: funnelEdgeCases.flat,
      ties: funnelEdgeCases.ties,
      extreme: funnelEdgeCases.extreme,
      "long-label": funnelEdgeCases.longLabel,
      negative: funnelEdgeCases.negative,
      increasing: funnelEdgeCases.increasing,
      duplicate: funnelEdgeCases.duplicate,
      nonfinite: funnelEdgeCases.nonfinite,
      blank: funnelEdgeCases.blank,
    };
    const data = caseMap[previewCase] ?? funnelExample;
    return (
      <main className="template-preview" data-template-preview="F04">
        <FormalFunnelStageChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "F01") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: treemapEdgeCases.empty,
      single: treemapEdgeCases.single,
      missing: treemapEdgeCases.missing,
      zero: treemapEdgeCases.zero,
      "all-zero": treemapEdgeCases.allZero,
      extreme: treemapEdgeCases.extreme,
      "long-label": treemapEdgeCases.longLabel,
      many: treemapEdgeCases.many,
      equal: treemapEdgeCases.equal,
      negative: treemapEdgeCases.negative,
      invalid: treemapEdgeCases.invalid,
      duplicate: treemapEdgeCases.duplicate,
      nonfinite: treemapEdgeCases.nonfinite,
      "blank-parent": treemapEdgeCases.blankParent,
    };
    const data = caseMap[previewCase] ?? treemapExample;
    return (
      <main className="template-preview" data-template-preview="F01">
        <FormalTreemapChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "D05") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: regressionEdgeCases.empty,
      single: regressionEdgeCases.single,
      missing: regressionEdgeCases.missing,
      negative: regressionEdgeCases.negative,
      perfect: regressionEdgeCases.perfect,
      "flat-y": regressionEdgeCases.flatY,
      "degenerate-x": regressionEdgeCases.degenerateX,
      extreme: regressionEdgeCases.extreme,
      outlier: regressionEdgeCases.outlier,
      overlap: regressionEdgeCases.overlap,
      "long-label": regressionEdgeCases.longLabel,
      invalid: regressionEdgeCases.invalid,
      duplicate: regressionEdgeCases.duplicate,
      nonfinite: regressionEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? regressionExample;
    return (
      <main className="template-preview" data-template-preview="D05">
        <FormalRegressionChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "D07") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: histogramEdgeCases.empty,
      single: histogramEdgeCases.single,
      missing: histogramEdgeCases.missing,
      "zero-count": histogramEdgeCases.zeroCount,
      ties: histogramEdgeCases.ties,
      extreme: histogramEdgeCases.extreme,
      "long-label": histogramEdgeCases.longLabel,
      "negative-range": histogramEdgeCases.negativeRange,
      "invalid-gap": histogramEdgeCases.invalidGap,
      "unequal-width": histogramEdgeCases.unequalWidth,
      overlap: histogramEdgeCases.overlap,
      "negative-count": histogramEdgeCases.negativeCount,
      noninteger: histogramEdgeCases.noninteger,
      duplicate: histogramEdgeCases.duplicate,
      nonfinite: histogramEdgeCases.nonfinite,
      "blank-label": histogramEdgeCases.blankLabel,
    };
    const data = caseMap[previewCase] ?? histogramExample;
    return (
      <main className="template-preview" data-template-preview="D07">
        <FormalHistogramChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "D06") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: errorBarEdgeCases.empty,
      single: errorBarEdgeCases.single,
      missing: errorBarEdgeCases.missing,
      negative: errorBarEdgeCases.negative,
      asymmetric: errorBarEdgeCases.asymmetric,
      "zero-error": errorBarEdgeCases.zeroError,
      constant: errorBarEdgeCases.constant,
      extreme: errorBarEdgeCases.extreme,
      "long-label": errorBarEdgeCases.longLabel,
      "invalid-order": errorBarEdgeCases.invalidOrder,
      "partial-missing": errorBarEdgeCases.partialMissing,
      invalid: errorBarEdgeCases.invalid,
      duplicate: errorBarEdgeCases.duplicate,
      nonfinite: errorBarEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? errorBarExample;
    return (
      <main className="template-preview" data-template-preview="D06">
        <FormalErrorBarChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "D04") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: boxPlotEdgeCases.empty,
      single: boxPlotEdgeCases.single,
      missing: boxPlotEdgeCases.missing,
      negative: boxPlotEdgeCases.negative,
      constant: boxPlotEdgeCases.constant,
      extreme: boxPlotEdgeCases.extreme,
      outliers: boxPlotEdgeCases.outliers,
      "long-label": boxPlotEdgeCases.longLabel,
      "invalid-order": boxPlotEdgeCases.invalidOrder,
      duplicate: boxPlotEdgeCases.duplicate,
      nonfinite: boxPlotEdgeCases.nonfinite,
      "invalid-outlier": boxPlotEdgeCases.invalidOutlier,
      "partial-missing": boxPlotEdgeCases.partialMissing,
    };
    const data = caseMap[previewCase] ?? boxPlotExample;
    return (
      <main className="template-preview" data-template-preview="D04">
        <FormalBoxPlotChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "D02") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: quadrantScatterEdgeCases.empty,
      single: quadrantScatterEdgeCases.single,
      "each-quadrant": quadrantScatterEdgeCases.eachQuadrant,
      boundary: quadrantScatterEdgeCases.boundary,
      missing: quadrantScatterEdgeCases.missing,
      negative: quadrantScatterEdgeCases.negative,
      constant: quadrantScatterEdgeCases.constant,
      extreme: quadrantScatterEdgeCases.extreme,
      overlap: quadrantScatterEdgeCases.overlap,
      "long-label": quadrantScatterEdgeCases.longLabel,
      invalid: quadrantScatterEdgeCases.invalid,
      duplicate: quadrantScatterEdgeCases.duplicate,
      nonfinite: quadrantScatterEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? quadrantScatterExample;
    const thresholdX =
      previewCase === "invalid-threshold"
        ? Infinity
        : previewCase === "negative"
          ? -20
          : 50;
    const thresholdY = previewCase === "negative" ? -10 : 50;
    return (
      <main className="template-preview" data-template-preview="D02">
        <FormalQuadrantScatterChart
          data={data}
          thresholdX={thresholdX}
          thresholdY={thresholdY}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "D01") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: scatterEdgeCases.empty,
      single: scatterEdgeCases.single,
      missing: scatterEdgeCases.missing,
      negative: scatterEdgeCases.negative,
      constant: scatterEdgeCases.constant,
      extreme: scatterEdgeCases.extreme,
      overlap: scatterEdgeCases.overlap,
      "long-label": scatterEdgeCases.longLabel,
      invalid: scatterEdgeCases.invalid,
      duplicate: scatterEdgeCases.duplicate,
      nonfinite: scatterEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? scatterExample;
    return (
      <main className="template-preview" data-template-preview="D01">
        <FormalScatterChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T12") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? synchronizedSmallMultiplesEdgeCases.empty
        : previewCase === "two-panels"
          ? synchronizedSmallMultiplesEdgeCases.twoPanels
          : previewCase === "four-panels"
            ? synchronizedSmallMultiplesEdgeCases.fourPanels
            : previewCase === "missing"
              ? synchronizedSmallMultiplesEdgeCases.missing
              : previewCase === "leading-trailing"
                ? synchronizedSmallMultiplesEdgeCases.leadingTrailing
                : previewCase === "negative"
                  ? synchronizedSmallMultiplesEdgeCases.negative
                  : previewCase === "constant"
                    ? synchronizedSmallMultiplesEdgeCases.constant
                    : previewCase === "extreme"
                      ? synchronizedSmallMultiplesEdgeCases.extreme
                      : previewCase === "long-labels"
                        ? synchronizedSmallMultiplesEdgeCases.longLabels
                        : previewCase === "mismatched-labels"
                          ? synchronizedSmallMultiplesEdgeCases.mismatchedLabels
                          : previewCase === "one-panel"
                            ? synchronizedSmallMultiplesEdgeCases.onePanel
                            : previewCase === "five-panels"
                              ? synchronizedSmallMultiplesEdgeCases.fivePanels
                              : previewCase === "duplicate-panel"
                                ? synchronizedSmallMultiplesEdgeCases.duplicatePanel
                                : previewCase === "nonfinite"
                                  ? synchronizedSmallMultiplesEdgeCases.nonfinite
                                  : synchronizedSmallMultiplesExample;
    return (
      <main className="template-preview" data-template-preview="T12">
        <FormalSynchronizedSmallMultiplesChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T11") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: percentAreaEdgeCases.empty,
      single: percentAreaEdgeCases.single,
      "missing-value": percentAreaEdgeCases.missingValue,
      "missing-comparison": percentAreaEdgeCases.missingComparison,
      "leading-gap": percentAreaEdgeCases.leadingGap,
      "trailing-gap": percentAreaEdgeCases.trailingGap,
      "zero-segment": percentAreaEdgeCases.zeroSegment,
      constant: percentAreaEdgeCases.constant,
      extreme: percentAreaEdgeCases.extreme,
      "long-label": percentAreaEdgeCases.longLabel,
      "zero-total": percentAreaEdgeCases.zeroTotal,
      negative: percentAreaEdgeCases.negative,
      invalid: percentAreaEdgeCases.invalid,
      duplicate: percentAreaEdgeCases.duplicate,
      nonfinite: percentAreaEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? percentAreaExample;
    return (
      <main className="template-preview" data-template-preview="T11">
        <FormalPercentAreaChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T10") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: indexedEventEdgeCases.empty,
      single: indexedEventEdgeCases.single,
      "no-event": indexedEventEdgeCases.noEvent,
      "missing-primary": indexedEventEdgeCases.missingPrimary,
      "missing-comparison": indexedEventEdgeCases.missingComparison,
      "leading-gap": indexedEventEdgeCases.leadingGap,
      "trailing-gap": indexedEventEdgeCases.trailingGap,
      "multiple-events": indexedEventEdgeCases.multipleEvents,
      "negative-index": indexedEventEdgeCases.negativeIndex,
      "constant-at-100": indexedEventEdgeCases.constantAt100,
      extreme: indexedEventEdgeCases.extreme,
      "long-event": indexedEventEdgeCases.longEvent,
      "long-label": indexedEventEdgeCases.longLabel,
      invalid: indexedEventEdgeCases.invalid,
      duplicate: indexedEventEdgeCases.duplicate,
      nonfinite: indexedEventEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? indexedEventExample;
    return (
      <main className="template-preview" data-template-preview="T10">
        <FormalIndexedEventTrendChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T08") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: stackedAreaEdgeCases.empty,
      single: stackedAreaEdgeCases.single,
      "missing-value": stackedAreaEdgeCases.missingValue,
      "missing-comparison": stackedAreaEdgeCases.missingComparison,
      zero: stackedAreaEdgeCases.zero,
      constant: stackedAreaEdgeCases.constant,
      arbitrary: stackedAreaEdgeCases.arbitrary,
      extreme: stackedAreaEdgeCases.extreme,
      "long-label": stackedAreaEdgeCases.longLabel,
      "invalid-negative": stackedAreaEdgeCases.invalidNegative,
      duplicate: stackedAreaEdgeCases.duplicate,
      nonfinite: stackedAreaEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? stackedAreaExample;
    return (
      <main className="template-preview" data-template-preview="T08">
        <FormalStackedAreaChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T07") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: multiSeriesAreaEdgeCases.empty,
      single: multiSeriesAreaEdgeCases.single,
      "missing-primary": multiSeriesAreaEdgeCases.missingPrimary,
      "missing-comparison": multiSeriesAreaEdgeCases.missingComparison,
      "leading-gap": multiSeriesAreaEdgeCases.leadingGap,
      "trailing-gap": multiSeriesAreaEdgeCases.trailingGap,
      negative: multiSeriesAreaEdgeCases.negative,
      mixed: multiSeriesAreaEdgeCases.mixed,
      constant: multiSeriesAreaEdgeCases.constant,
      extreme: multiSeriesAreaEdgeCases.extreme,
      "long-label": multiSeriesAreaEdgeCases.longLabel,
      invalid: multiSeriesAreaEdgeCases.invalid,
      duplicate: multiSeriesAreaEdgeCases.duplicate,
      nonfinite: multiSeriesAreaEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? multiSeriesAreaExample;
    return (
      <main className="template-preview" data-template-preview="T07">
        <FormalMultiSeriesAreaChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T06") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: trendAreaEdgeCases.empty,
      single: trendAreaEdgeCases.single,
      missing: trendAreaEdgeCases.missing,
      "leading-gap": trendAreaEdgeCases.leadingGap,
      "trailing-gap": trendAreaEdgeCases.trailingGap,
      negative: trendAreaEdgeCases.negative,
      signed: trendAreaEdgeCases.signed,
      zero: trendAreaEdgeCases.zero,
      constant: trendAreaEdgeCases.constant,
      extreme: trendAreaEdgeCases.extreme,
      "long-label": trendAreaEdgeCases.longLabel,
      invalid: trendAreaEdgeCases.invalid,
      duplicate: trendAreaEdgeCases.duplicate,
      nonfinite: trendAreaEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? trendAreaExample;
    return (
      <main className="template-preview" data-template-preview="T06">
        <FormalTrendAreaChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T05") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: targetLineEdgeCases.empty,
      single: targetLineEdgeCases.single,
      missing: targetLineEdgeCases.missing,
      "leading-gap": targetLineEdgeCases.leadingGap,
      "trailing-gap": targetLineEdgeCases.trailingGap,
      negative: targetLineEdgeCases.negative,
      constant: targetLineEdgeCases.constant,
      "target-above": targetLineEdgeCases.targetAbove,
      "target-below": targetLineEdgeCases.targetBelow,
      "at-target": targetLineEdgeCases.atTarget,
      extreme: targetLineEdgeCases.extreme,
      "long-label": targetLineEdgeCases.longLabel,
      invalid: targetLineEdgeCases.invalid,
      duplicate: targetLineEdgeCases.duplicate,
      nonfinite: targetLineEdgeCases.nonfinite,
      "invalid-target": targetLineEdgeCases.invalidTarget,
    };
    const data = caseMap[previewCase] ?? targetLineExample;
    return (
      <main className="template-preview" data-template-preview="T05">
        <FormalTargetLineChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T04") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: valueDotLineEdgeCases.empty,
      single: valueDotLineEdgeCases.single,
      missing: valueDotLineEdgeCases.missing,
      "leading-gap": valueDotLineEdgeCases.leadingGap,
      "trailing-gap": valueDotLineEdgeCases.trailingGap,
      negative: valueDotLineEdgeCases.negative,
      constant: valueDotLineEdgeCases.constant,
      "near-collision": valueDotLineEdgeCases.nearCollision,
      extreme: valueDotLineEdgeCases.extreme,
      "long-label": valueDotLineEdgeCases.longLabel,
      invalid: valueDotLineEdgeCases.invalid,
      duplicate: valueDotLineEdgeCases.duplicate,
      nonfinite: valueDotLineEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? valueDotLineExample;
    return (
      <main className="template-preview" data-template-preview="T04">
        <FormalValueDotLineChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T03") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? stepLineEdgeCases.empty
        : previewCase === "single"
          ? stepLineEdgeCases.single
          : previewCase === "missing"
            ? stepLineEdgeCases.missing
            : previewCase === "leading-gap"
              ? stepLineEdgeCases.leadingGap
              : previewCase === "trailing-gap"
                ? stepLineEdgeCases.trailingGap
                : previewCase === "negative"
                  ? stepLineEdgeCases.negative
                  : previewCase === "constant"
                    ? stepLineEdgeCases.constant
                    : previewCase === "extreme"
                      ? stepLineEdgeCases.extreme
                      : previewCase === "long-label"
                        ? stepLineEdgeCases.longLabel
                        : previewCase === "duplicate"
                          ? stepLineEdgeCases.duplicate
                          : previewCase === "nonfinite"
                            ? stepLineEdgeCases.nonfinite
                            : previewCase === "invalid"
                              ? stepLineEdgeCases.invalid
                              : stepLineExample;
    return (
      <main className="template-preview" data-template-preview="T03">
        <FormalStepLineChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T02") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? multiSeriesLineEdgeCases.empty
        : previewCase === "single"
          ? multiSeriesLineEdgeCases.single
          : previewCase === "missing-primary"
            ? multiSeriesLineEdgeCases.missingPrimary
            : previewCase === "missing-comparison"
              ? multiSeriesLineEdgeCases.missingComparison
              : previewCase === "leading-gap"
                ? multiSeriesLineEdgeCases.leadingGap
                : previewCase === "trailing-gap"
                  ? multiSeriesLineEdgeCases.trailingGap
                  : previewCase === "negative"
                    ? multiSeriesLineEdgeCases.negative
                    : previewCase === "constant"
                      ? multiSeriesLineEdgeCases.constant
                      : previewCase === "extreme"
                        ? multiSeriesLineEdgeCases.extreme
                        : previewCase === "long-label"
                          ? multiSeriesLineEdgeCases.longLabel
                          : previewCase === "duplicate"
                            ? multiSeriesLineEdgeCases.duplicate
                            : previewCase === "nonfinite"
                              ? multiSeriesLineEdgeCases.nonfinite
                              : previewCase === "invalid"
                                ? multiSeriesLineEdgeCases.invalid
                                : multiSeriesLineExample;
    return (
      <main className="template-preview" data-template-preview="T02">
        <FormalMultiSeriesLineChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T01") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? trendLineEdgeCases.empty
        : previewCase === "single"
          ? trendLineEdgeCases.single
          : previewCase === "missing"
            ? trendLineEdgeCases.missing
            : previewCase === "leading-gap"
              ? trendLineEdgeCases.leadingGap
              : previewCase === "trailing-gap"
                ? trendLineEdgeCases.trailingGap
                : previewCase === "negative"
                  ? trendLineEdgeCases.negative
                  : previewCase === "constant"
                    ? trendLineEdgeCases.constant
                    : previewCase === "extreme"
                      ? trendLineEdgeCases.extreme
                      : previewCase === "long-label"
                        ? trendLineEdgeCases.longLabel
                        : previewCase === "duplicate"
                          ? trendLineEdgeCases.duplicate
                          : previewCase === "invalid"
                            ? trendLineEdgeCases.invalid
                            : trendLineExample;
    return (
      <main className="template-preview" data-template-preview="T01">
        <FormalTrendLineChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C09") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? percentStackedEdgeCases.empty
        : previewCase === "single"
          ? percentStackedEdgeCases.single
          : previewCase === "missing-value"
            ? percentStackedEdgeCases.missingValue
            : previewCase === "missing-comparison"
              ? percentStackedEdgeCases.missingComparison
              : previewCase === "zero-segment"
                ? percentStackedEdgeCases.zeroSegment
                : previewCase === "zero-total"
                  ? percentStackedEdgeCases.zeroTotal
                  : previewCase === "negative"
                    ? percentStackedEdgeCases.negative
                    : previewCase === "extreme-ratios"
                      ? percentStackedEdgeCases.extremeRatios
                      : previewCase === "long-label"
                        ? percentStackedEdgeCases.longLabel
                        : previewCase === "duplicate"
                          ? percentStackedEdgeCases.duplicate
                          : previewCase === "nonfinite"
                            ? percentStackedEdgeCases.nonfinite
                            : percentStackedExample;
    return (
      <main className="template-preview" data-template-preview="C09">
        <FormalPercentStackedChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C08") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? divergingBarEdgeCases.empty
        : previewCase === "single"
          ? divergingBarEdgeCases.single
          : previewCase === "missing"
            ? divergingBarEdgeCases.missing
            : previewCase === "leading-null"
              ? divergingBarEdgeCases.leadingNull
              : previewCase === "all-positive"
                ? divergingBarEdgeCases.allPositive
                : previewCase === "all-negative"
                  ? divergingBarEdgeCases.allNegative
                  : previewCase === "mixed"
                    ? divergingBarEdgeCases.mixed
                    : previewCase === "zero"
                      ? divergingBarEdgeCases.zero
                      : previewCase === "extreme"
                        ? divergingBarEdgeCases.extreme
                        : previewCase === "long-label"
                          ? divergingBarEdgeCases.longLabel
                          : previewCase === "ties"
                            ? divergingBarEdgeCases.ties
                            : previewCase === "invalid"
                              ? divergingBarEdgeCases.invalid
                              : divergingBarExample;
    return (
      <main className="template-preview" data-template-preview="C08">
        <FormalDivergingBarChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C07") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? stackedBarEdgeCases.empty
        : previewCase === "single"
          ? stackedBarEdgeCases.single
          : previewCase === "missing-value"
            ? stackedBarEdgeCases.missingValue
            : previewCase === "missing-comparison"
              ? stackedBarEdgeCases.missingComparison
              : previewCase === "negative"
                ? stackedBarEdgeCases.negative
                : previewCase === "arbitrary-total"
                  ? stackedBarEdgeCases.arbitraryTotal
                  : previewCase === "extreme"
                    ? stackedBarEdgeCases.extreme
                    : previewCase === "long-label"
                      ? stackedBarEdgeCases.longLabel
                      : previewCase === "flat"
                        ? stackedBarEdgeCases.flat
                        : previewCase === "invalid"
                          ? stackedBarEdgeCases.invalid
                          : stackedBarExample;
    return (
      <main className="template-preview" data-template-preview="C07">
        <FormalStackedBarChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C06") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? groupedBarEdgeCases.empty
        : previewCase === "single"
          ? groupedBarEdgeCases.single
          : previewCase === "missing-primary"
            ? groupedBarEdgeCases.missingPrimary
            : previewCase === "missing-comparison"
              ? groupedBarEdgeCases.missingComparison
              : previewCase === "negative"
                ? groupedBarEdgeCases.negative
                : previewCase === "extreme"
                  ? groupedBarEdgeCases.extreme
                  : previewCase === "long-label"
                    ? groupedBarEdgeCases.longLabel
                    : previewCase === "flat"
                      ? groupedBarEdgeCases.flat
                      : previewCase === "invalid"
                        ? groupedBarEdgeCases.invalid
                        : groupedBarExample;
    return (
      <main className="template-preview" data-template-preview="C06">
        <FormalGroupedBarChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C05") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? horizontalRankingEdgeCases.empty
        : previewCase === "single"
          ? horizontalRankingEdgeCases.single
          : previewCase === "missing"
            ? horizontalRankingEdgeCases.missing
            : previewCase === "negative"
              ? horizontalRankingEdgeCases.negative
              : previewCase === "ties"
                ? horizontalRankingEdgeCases.ties
                : previewCase === "extreme"
                  ? horizontalRankingEdgeCases.extreme
                  : previewCase === "long-label"
                    ? horizontalRankingEdgeCases.longLabel
                    : previewCase === "invalid"
                      ? horizontalRankingEdgeCases.invalid
                      : horizontalRankingExample;
    return (
      <main className="template-preview" data-template-preview="C05">
        <FormalHorizontalRankingChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C04") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? stackedColumnEdgeCases.empty
        : previewCase === "single"
          ? stackedColumnEdgeCases.single
          : previewCase === "missing-value"
            ? stackedColumnEdgeCases.missingValue
            : previewCase === "missing-comparison"
              ? stackedColumnEdgeCases.missingComparison
              : previewCase === "negative"
                ? stackedColumnEdgeCases.negative
                : previewCase === "extreme"
                  ? stackedColumnEdgeCases.extreme
                  : previewCase === "long-label"
                    ? stackedColumnEdgeCases.longLabel
                    : previewCase === "flat-zero"
                      ? stackedColumnEdgeCases.flatZero
                      : previewCase === "invalid"
                        ? stackedColumnEdgeCases.invalid
                        : stackedColumnExample;
    return (
      <main className="template-preview" data-template-preview="C04">
        <FormalStackedColumnChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C03") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? groupedColumnEdgeCases.empty
        : previewCase === "single"
          ? groupedColumnEdgeCases.single
          : previewCase === "missing-primary"
            ? groupedColumnEdgeCases.missingPrimary
            : previewCase === "missing-comparison"
              ? groupedColumnEdgeCases.missingComparison
              : previewCase === "negative"
                ? groupedColumnEdgeCases.negative
                : previewCase === "extreme"
                  ? groupedColumnEdgeCases.extreme
                  : previewCase === "long-label"
                    ? groupedColumnEdgeCases.longLabel
                    : previewCase === "flat-zero"
                      ? groupedColumnEdgeCases.flatZero
                      : previewCase === "invalid"
                        ? groupedColumnEdgeCases.invalid
                        : groupedColumnExample;
    return (
      <main className="template-preview" data-template-preview="C03">
        <FormalGroupedColumnChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C02") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "empty"
        ? roundedColumnEdgeCases.empty
        : previewCase === "single"
          ? roundedColumnEdgeCases.single
          : previewCase === "missing"
            ? roundedColumnEdgeCases.missing
            : previewCase === "negative"
              ? roundedColumnEdgeCases.negative
              : previewCase === "small-zero"
                ? roundedColumnEdgeCases.smallAndZero
                : previewCase === "extreme"
                  ? roundedColumnEdgeCases.extreme
                  : previewCase === "long-label"
                    ? roundedColumnEdgeCases.longLabel
                    : previewCase === "invalid"
                      ? roundedColumnEdgeCases.invalid
                      : roundedColumnExample;
    return (
      <main className="template-preview" data-template-preview="C02">
        <FormalRoundedColumnChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C01") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing"
        ? simpleColumnEdgeCases.missing
        : previewCase === "negative"
          ? simpleColumnEdgeCases.negative
          : previewCase === "extreme"
            ? simpleColumnEdgeCases.extreme
            : previewCase === "long-label"
              ? simpleColumnEdgeCases.longLabel
              : previewCase === "invalid"
                ? simpleColumnEdgeCases.invalid
                : simpleColumnExample;
    return (
      <main className="template-preview" data-template-preview="C01">
        <FormalSimpleColumnChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C10") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing"
        ? profitBridgeEdgeCases.missing
        : previewCase === "long-label"
          ? profitBridgeEdgeCases.longLabel
          : profitBridgeExample;
    return (
      <main className="template-preview" data-template-preview="C10">
        <ProfitBridgeChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "C11") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "editorial";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing"
        ? dumbbellEdgeCases.missing
        : previewCase === "long-label"
          ? dumbbellEdgeCases.longLabel
          : dumbbellExample;
    return (
      <main className="template-preview" data-template-preview="C11">
        <FormalDumbbellChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T09") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "editorial";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing"
        ? rangeAreaEdgeCases.missing
        : previewCase === "long-label"
          ? rangeAreaEdgeCases.longLabel
          : previewCase === "signed"
            ? rangeAreaEdgeCases.signed
            : previewCase === "extreme"
              ? rangeAreaEdgeCases.extreme
              : rangeAreaExample;
    return (
      <main className="template-preview" data-template-preview="T09">
        <FormalRangeAreaChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "T13") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "digital";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing"
        ? brushTimeSeriesEdgeCases.missing
        : previewCase === "invalid"
          ? brushTimeSeriesEdgeCases.invalid
          : previewCase === "long-label"
            ? brushTimeSeriesEdgeCases.longLabel
            : previewCase === "signed"
              ? brushTimeSeriesEdgeCases.signed
              : previewCase === "extreme"
                ? brushTimeSeriesEdgeCases.extreme
                : brushTimeSeriesExample;
    return (
      <main className="template-preview" data-template-preview="T13">
        <FormalBrushTimeSeriesChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "P05") {
    const visualSystem = visualSystemIds.includes(previewTheme) ? previewTheme : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: needleGaugeEdgeCases.empty,
      "single-band": needleGaugeEdgeCases.singleBand,
      missing: needleGaugeEdgeCases.missing,
      "negative-range": needleGaugeEdgeCases.negativeRange,
      minimum: needleGaugeEdgeCases.minimum,
      maximum: needleGaugeEdgeCases.maximum,
      "below-range": needleGaugeEdgeCases.belowRange,
      "above-range": needleGaugeEdgeCases.aboveRange,
      "equal-range": needleGaugeEdgeCases.equalRange,
      unordered: needleGaugeEdgeCases.unordered,
      uncovered: needleGaugeEdgeCases.uncovered,
      nonfinite: needleGaugeEdgeCases.nonfinite,
      extreme: needleGaugeEdgeCases.extreme,
      "long-label": needleGaugeEdgeCases.longLabel,
    };
    const data = previewCase === "empty" ? null : caseMap[previewCase] ?? needleGaugeExample;
    return <main className="template-preview" data-template-preview="P05"><FormalNeedleGaugeChart data={data} visualSystem={visualSystem} animate={!captureMode} unit={previewCase === "negative-range" ? "°" : "%"} /></main>;
  }
  if (params.get("template") === "P01") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: pieEdgeCases.empty,
      single: pieEdgeCases.single,
      missing: pieEdgeCases.missing,
      zero: pieEdgeCases.zero,
      "all-zero": pieEdgeCases.allZero,
      "all-missing": pieEdgeCases.allMissing,
      negative: pieEdgeCases.negative,
      extreme: pieEdgeCases.extreme,
      "long-label": pieEdgeCases.longLabel,
      duplicate: pieEdgeCases.duplicate,
      nonfinite: pieEdgeCases.nonfinite,
      blank: pieEdgeCases.blank,
    };
    const data = caseMap[previewCase] ?? pieExample;
    return (
      <main className="template-preview" data-template-preview="P01">
        <FormalPieCompositionChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "P02") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: donutEdgeCases.empty,
      single: donutEdgeCases.single,
      missing: donutEdgeCases.missing,
      zero: donutEdgeCases.zero,
      "all-zero": donutEdgeCases.allZero,
      equal: donutEdgeCases.equal,
      extreme: donutEdgeCases.extreme,
      "long-label": donutEdgeCases.longLabel,
      many: donutEdgeCases.many,
      negative: donutEdgeCases.negative,
      duplicate: donutEdgeCases.duplicate,
      blank: donutEdgeCases.blank,
      nonfinite: donutEdgeCases.nonfinite,
    };
    const data = caseMap[previewCase] ?? donutExample;
    return (
      <main className="template-preview" data-template-preview="P02">
        <FormalDonutChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "P03") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const caseMap = {
      empty: labelledDonutEdgeCases.empty,
      single: labelledDonutEdgeCases.single,
      missing: labelledDonutEdgeCases.missing,
      zero: labelledDonutEdgeCases.zero,
      "all-zero": labelledDonutEdgeCases.allZero,
      equal: labelledDonutEdgeCases.equal,
      extreme: labelledDonutEdgeCases.extreme,
      "long-label": labelledDonutEdgeCases.longLabel,
      many: labelledDonutEdgeCases.many,
      negative: labelledDonutEdgeCases.negative,
      duplicate: labelledDonutEdgeCases.duplicate,
      nonfinite: labelledDonutEdgeCases.nonfinite,
      blank: labelledDonutEdgeCases.blank,
    };
    const data = caseMap[previewCase] ?? labelledDonutExample;
    return (
      <main className="template-preview" data-template-preview="P03">
        <FormalLabelledDonutChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "P04") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "digital";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing"
        ? radialProgressEdgeCases.missing
        : previewCase === "invalid"
          ? radialProgressEdgeCases.invalid
          : previewCase === "negative"
            ? radialProgressEdgeCases.negative
            : previewCase === "over-100"
              ? radialProgressEdgeCases.over100
              : previewCase === "long-label"
                ? radialProgressEdgeCases.longLabel
                : previewCase === "extreme"
                  ? radialProgressEdgeCases.extreme
                  : radialProgressExample;
    return (
      <main className="template-preview" data-template-preview="P04">
        <FormalRadialProgressChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "D03") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing"
        ? bubbleQuadrantEdgeCases.missing
        : previewCase === "invalid"
          ? bubbleQuadrantEdgeCases.invalid
          : previewCase === "negative"
            ? bubbleQuadrantEdgeCases.negative
            : previewCase === "zero-size"
              ? bubbleQuadrantEdgeCases.zeroSize
              : previewCase === "extreme"
                ? bubbleQuadrantEdgeCases.extreme
                : previewCase === "long-label"
                  ? bubbleQuadrantEdgeCases.longLabel
                  : previewCase === "overlap"
                    ? bubbleQuadrantEdgeCases.overlap
                    : bubbleQuadrantExample;
    return (
      <main className="template-preview" data-template-preview="D03">
        <FormalBubbleQuadrantChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "D08") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "digital";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing"
        ? heatmapEdgeCases.missing
        : previewCase === "duplicate"
          ? heatmapEdgeCases.duplicate
          : previewCase === "negative"
            ? heatmapEdgeCases.negative
            : previewCase === "extreme"
              ? heatmapEdgeCases.extreme
              : previewCase === "long-label"
                ? heatmapEdgeCases.longLabel
                : previewCase === "sparse"
                  ? heatmapEdgeCases.sparse
                  : previewCase === "constant"
                    ? heatmapEdgeCases.constant
                    : heatmapExample;
    return (
      <main className="template-preview" data-template-preview="D08">
        <FormalHeatmapChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "F02") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const sankeyCase = previewCase === "long-label" ? "longLabel" : previewCase;
    const data =
      sankeyCase && sankeyCase in sankeyEdgeCases
        ? sankeyEdgeCases[sankeyCase]
        : sankeyExample;
    return (
      <main className="template-preview" data-template-preview="F02">
        <FormalSankeyChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "F03") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "editorial";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing"
        ? timelineEdgeCases.missing
        : previewCase === "inverted"
          ? timelineEdgeCases.inverted
          : previewCase === "negative"
            ? timelineEdgeCases.negative
            : previewCase === "zero-duration"
              ? timelineEdgeCases.zeroDuration
              : previewCase === "extreme"
                ? timelineEdgeCases.extreme
                : previewCase === "long-label"
                  ? timelineEdgeCases.longLabel
                  : previewCase === "overlap"
                    ? timelineEdgeCases.overlap
                    : timelineExample;
    return (
      <main className="template-preview" data-template-preview="F03">
        <FormalTimelineChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }
  if (params.get("template") === "B03") {
    const visualSystem = visualSystemIds.includes(previewTheme)
      ? previewTheme
      : "signal";
    const previewCase = params.get("case");
    const data =
      previewCase === "missing-bar"
        ? dualAxisEdgeCases.missingBar
        : previewCase === "missing-line"
          ? dualAxisEdgeCases.missingLine
          : previewCase === "invalid"
            ? dualAxisEdgeCases.invalid
            : previewCase === "nonfinite"
              ? dualAxisEdgeCases.nonfinite
              : previewCase === "negative"
                ? dualAxisEdgeCases.negative
                : previewCase === "extreme"
                  ? dualAxisEdgeCases.extreme
                  : previewCase === "long-label"
                    ? dualAxisEdgeCases.longLabel
                    : previewCase === "flat"
                      ? dualAxisEdgeCases.flat
                      : dualAxisExample;
    return (
      <main className="template-preview" data-template-preview="B03">
        <FormalDualAxisChart
          data={data}
          visualSystem={visualSystem}
          animate={!captureMode}
        />
      </main>
    );
  }

  return (
    <main>
      {visualSystemIds.map((themeKey) => (
        <Board key={themeKey} themeKey={themeKey} />
      ))}
    </main>
  );
}

const rootElement = document.getElementById("root");
const appRoot = window.__MAV_CHARTS_ROOT__ ?? createRoot(rootElement);
window.__MAV_CHARTS_ROOT__ = appRoot;
appRoot.render(<App />);
