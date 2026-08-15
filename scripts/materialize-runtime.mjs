#!/usr/bin/env node

import { cp, mkdir, readdir, stat } from "node:fs/promises";
import { dirname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = dirname(fileURLToPath(import.meta.url));
const skillRoot = resolve(scriptDirectory, "..");
const runtimeSource = resolve(skillRoot, "assets", "mav-charts");

function readOutputArgument(argv) {
  const index = argv.indexOf("--output");
  if (index === -1 || !argv[index + 1]) {
    throw new Error("Usage: node scripts/materialize-runtime.mjs --output <absolute-or-relative-directory>");
  }
  return resolve(argv[index + 1]);
}

async function ensureEmptyDirectory(directory) {
  try {
    const info = await stat(directory);
    if (!info.isDirectory()) throw new Error(`Output exists and is not a directory: ${directory}`);
    const entries = await readdir(directory);
    if (entries.length > 0) throw new Error(`Output directory must be empty: ${directory}`);
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    await mkdir(directory, { recursive: true });
  }
}

const excludedNames = new Set([
  "node_modules",
  "dist",
  ".vite",
  "coverage",
  "playwright-report",
  "test-results",
]);

const outputDirectory = readOutputArgument(process.argv.slice(2));
if (
  outputDirectory === runtimeSource
  || outputDirectory.startsWith(`${runtimeSource}${sep}`)
  || runtimeSource.startsWith(`${outputDirectory}${sep}`)
) {
  throw new Error("Output must not be the bundled runtime, its child, or one of its parent directories.");
}

await ensureEmptyDirectory(outputDirectory);
await cp(runtimeSource, outputDirectory, {
  recursive: true,
  filter(source) {
    return !excludedNames.has(source.split(/[\\/]/).at(-1));
  },
});

process.stdout.write(`${JSON.stringify({ skillRoot, runtimeSource, outputDirectory }, null, 2)}\n`);
