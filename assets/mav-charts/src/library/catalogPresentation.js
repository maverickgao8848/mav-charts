import { prototypeCatalog } from "../../packages/catalog/src";

export const REPOSITORY = "https://github.com/maverickgao8848/mav-charts";
export const systems = ["signal", "editorial", "digital"];
export const questionLabels = { compare: "对比", trend: "趋势", composition: "构成", distribution: "分布", relationship: "关系", flow: "流向", progress: "进度" };
export const systemLabels = { signal: "信号", editorial: "编辑", digital: "数字" };
export const audienceLabels = { consulting: "咨询", finance: "金融", product: "产品", marketing: "市场", operations: "运营" };
export const scenarioLabels = { report: "报告", dashboard: "仪表板", web: "网页", video: "视频" };

export const questionGuidance = {
  compare: { fit: "比较不同类别、对象或方案之间的高低与差距。", avoid: "不适合讲述长时间变化，也不适合说明各部分占整体的比例。" },
  trend: { fit: "观察指标随时间或有序阶段怎样变化。", avoid: "不适合只比较几个互不相关的类别，也不适合表达整体构成。" },
  composition: { fit: "说明一个整体由哪些部分组成，以及各部分所占比例。", avoid: "不适合精确比较非常接近的数值，也不要混入彼此重叠的类别。" },
  distribution: { fit: "查看数据集中、分散、偏斜或异常值出现在哪里。", avoid: "不适合强调单个对象的精确排名，也不用于讲述时间变化。" },
  relationship: { fit: "判断两个或多个变量之间是否存在关联、分组或异常点。", avoid: "不适合表达时间顺序、流程阶段或整体构成。" },
  flow: { fit: "展示数量如何在明确的阶段、节点或分支之间流动。", avoid: "没有明确流向关系的数据不要使用，也不要把普通分类比较包装成流程。" },
  progress: { fit: "展示当前值距离明确目标、区间或完成状态还有多远。", avoid: "没有明确目标或合理上限时不要使用，以免制造虚假的进度感。" },
};

const fieldLabels = { label: "名称", value: "数值", detail: "说明", comparison: "对比值", primary: "主要数值", target: "目标值", actual: "实际值", min: "最小值", max: "最大值", low: "最低值", high: "最高值", open: "开盘值", close: "收盘值", median: "中位数", q1: "下四分位数", q3: "上四分位数", x: "横轴数值", y: "纵轴数值", size: "大小", start: "开始", end: "结束", source: "来源节点", targetId: "目标节点", path: "层级路径", id: "唯一编号", title: "标题", unit: "单位", data: "数据列表", event: "事件说明" };
const fieldDescriptions = { label: "每条数据的名称，不能为空或重复。", value: "主要绘图数值；缺失时留空，不要写成 0。", detail: "可选补充说明，用于提示与无障碍文本。", target: "与实际值使用相同单位的目标。", actual: "当前真实结果。", x: "决定横向位置的数字。", y: "决定纵向位置的数字。", source: "流向开始节点。", targetId: "流向到达节点。", path: "从上到下的层级名称列表。" };

const schemaFiles = import.meta.glob("../../packages/charts/src/*/schema.ts", { query: "?raw", import: "default", eager: true });

function artifact(files, item) {
  const marker = `/${item.id}-${item.slug}/`;
  return Object.entries(files).find(([path]) => path.includes(marker))?.[1] || "";
}

export function dataFields(item) {
  const schema = artifact(schemaFiles, item);
  const datum = schema.match(/export type\s+\w*Datum\s*=\s*\{([\s\S]*?)\};/i)?.[1]
    || schema.match(/export interface\s+\w*Datum\s*\{([\s\S]*?)\}/i)?.[1]
    || "";
  const parsed = [...datum.matchAll(/^\s*(\w+)(\?)?:\s*([^;]+);/gm)].map((match) => ({
    key: match[1], optional: Boolean(match[2]), type: match[3].trim(), label: fieldLabels[match[1]] || match[1],
    description: fieldDescriptions[match[1]] || `按 ${match[3].trim()} 格式提供。`,
  }));
  return (parsed.length ? parsed : [
    { key: "label", type: "string", optional: false, label: "名称", description: fieldDescriptions.label },
    { key: "value", type: "number | null", optional: false, label: "数值", description: fieldDescriptions.value },
  ]).slice(0, 8);
}

const motionBySystem = {
  signal: { enterMs: 800, holdMs: 1800, exitMs: 300, defaultSceneMs: 2900, minSceneMs: 2200, maxSceneMs: 6000 },
  editorial: { enterMs: 1000, holdMs: 1800, exitMs: 300, defaultSceneMs: 3100, minSceneMs: 2200, maxSceneMs: 6000 },
  digital: { enterMs: 1200, holdMs: 1900, exitMs: 300, defaultSceneMs: 3400, minSceneMs: 2200, maxSceneMs: 6000 },
};

export function chartWorkbenchItems(system = "signal") {
  return prototypeCatalog.map((item) => ({
    ...item,
    sourceUrl: `${REPOSITORY}/blob/main/${item.githubPath}`,
    fields: dataFields(item),
    guidance: questionGuidance[item.questions[0]] || questionGuidance.compare,
    motion: motionBySystem[system],
  }));
}

export function agentPrompt(item, system, detailUrl, durationMs) {
  const questions = item.id === "B03" ? [
    "横轴填什么？请提供类别或时间名称，并按显示顺序排列。",
    "左侧纵轴的几个数填什么？请说明柱子代表的指标、单位，以及每个横轴位置对应的柱子数值；纵轴刻度需要指定，还是根据数据自动生成？",
    "右侧纵轴的几个数填什么？请说明折线代表的指标、单位，以及刻度范围和间隔；也可以选择自动生成刻度。",
    "每一个点位的红点高度是多少？请按横轴顺序给出每个折线点对应的实际数值（使用右侧纵轴的单位，不需要提供像素高度）。",
  ] : item.fields.filter((field) => !field.optional).map((field) => `「${field.label}」填什么？${field.description} 请提供各条数据对应的内容（${field.key}）。`);
  questions.push("这个图表用到什么地方：做网页、导出图片，还是用于 HyperFrames 展示？");
  return `请使用 MAV Charts 的 ${item.id}「${item.nameZh}」，风格为${systemLabels[system]}（${system}）。\n详情：${detailUrl}\n源码：${item.sourceUrl}\n默认动画时长：${durationMs}ms\n数据字段：${item.fields.map((field) => field.key).join("、")}\n\n请先主动询问我需要的信息，不要立即生成代码：\n${questions.map((question, index) => `${index + 1}. ${question}`).join("\n")}\n\n已有信息不重复问，缺失数据不编造。收集完整后，根据我选择的用途制作相应形式的图表。`;
}
