#!/usr/bin/env node

import { readFile, stat } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(scriptDirectory, "..");
const runtime = resolve(skillRoot, "assets", "mav-charts");

async function requirePath(path) {
  await stat(path);
  return path;
}

const required = [
  "SKILL.md",
  "agents/openai.yaml",
  "references/repository-map.md",
  "references/intake-and-delivery.md",
  "assets/mav-charts/package.json",
  "assets/mav-charts/package-lock.json",
  "assets/mav-charts/packages/catalog/src/catalog.ts",
  "assets/mav-charts/packages/charts/src/index.ts",
  "assets/mav-charts/packages/themes/src/index.ts",
  "assets/mav-charts/public/catalog",
  "assets/mav-charts/public/fonts",
];

await Promise.all(required.map((path) => requirePath(resolve(skillRoot, path))));

const catalog = await readFile(resolve(runtime, "packages/catalog/src/catalog.ts"), "utf8");
const skillText = await readFile(resolve(skillRoot, "SKILL.md"), "utf8");
const repositoryMap = await readFile(resolve(skillRoot, "references/repository-map.md"), "utf8");
const ids = [...catalog.matchAll(/\bid:\s*"([A-Z]\d{2})"/g)].map((match) => match[1]);
const componentPaths = [...catalog.matchAll(/\bgithubPath:\s*"([^"]+)"/g)].map((match) => match[1]);

if (ids.length === 0 || componentPaths.length !== ids.length) {
  throw new Error(`Catalog parse mismatch: ${ids.length} IDs and ${componentPaths.length} component paths.`);
}

await Promise.all(componentPaths.map((path) => requirePath(resolve(runtime, path))));
await Promise.all(ids.flatMap((id) => ["signal", "editorial", "digital"].map((style) => requirePath(resolve(runtime, "public/catalog", `${id}-${style}.png`)))));

const combinedInstructions = `${skillText}\n${repositoryMap}`;
const machineSpecificPatterns = [/C:\\Users\\/i, /\/Users\/[^/]+\//, /\/home\/[^/]+\//];
if (machineSpecificPatterns.some((pattern) => pattern.test(combinedInstructions))) {
  throw new Error("Skill instructions contain a machine-specific absolute path.");
}

process.stdout.write(`${JSON.stringify({
  portable: true,
  skillRoot,
  runtime,
  templates: ids.length,
  componentPaths: componentPaths.length,
  stylePreviews: ids.length * 3,
}, null, 2)}\n`);
