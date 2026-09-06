import { describe, expect, it } from "vitest";
import { agentPrompt, chartWorkbenchItems } from "./catalogPresentation";

const componentSources = import.meta.glob("../../packages/charts/src/*/index.tsx", { query: "?raw", import: "default", eager: true });

describe("catalog presentation", () => {
  it("derives all workbench items from the canonical catalog", () => {
    const items = chartWorkbenchItems("editorial");
    expect(items).toHaveLength(48);
    expect(new Set(items.map((item) => item.id)).size).toBe(48);
    expect(items.every((item) => item.fields.length > 0 && item.sourceUrl && item.motion.defaultSceneMs === 3100)).toBe(true);
  });
  it("keeps the public motion contract on all 48 charts", () => {
    expect(Object.keys(componentSources)).toHaveLength(48);
    expect(Object.values(componentSources).every((source) => /durationMs\?:\s*number/.test(source) && /progress\?:\s*number/.test(source))).toBe(true);
  });
  it("includes selection, fields, duration, and URL in the Agent prompt", () => {
    const item = chartWorkbenchItems("digital")[0];
    const prompt = agentPrompt(item, "digital", "https://example.com/charts/C01", 3400);
    expect(prompt).toContain("C01"); expect(prompt).toContain("3400ms"); expect(prompt).toContain("label"); expect(prompt).toContain("https://example.com/charts/C01");
  });
  it("asks for dual-axis data before generating code", () => {
    const item = chartWorkbenchItems("signal").find((chart) => chart.id === "B03");
    const prompt = agentPrompt(item, "signal", "https://example.com/charts/B03", 2900);
    for (const text of ["B03", "信号（signal）", "横轴填什么", "左侧纵轴", "右侧纵轴", "红点高度", "barValue", "lineValue", "不要立即生成代码", "缺失数据不编造"]) expect(prompt).toContain(text);
    expect(prompt).toContain("做网页、导出图片，还是用于 HyperFrames 展示");
    expect(prompt).toContain("根据我选择的用途制作相应形式的图表");
  });
});

