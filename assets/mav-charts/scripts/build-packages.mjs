import { execFileSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync } from "node:fs";
import { resolve } from "node:path";
import { build } from "vite";

const root = resolve(import.meta.dirname, "..");
const packageNames = ["themes", "motion", "catalog", "examples", "charts"];
const external = [
  "react",
  "react-dom",
  "react/jsx-runtime",
  "react-dom/server",
  "recharts",
  "@mav-charts/themes",
  "@mav-charts/motion",
  "@mav-charts/catalog",
  "@mav-charts/examples",
];

function entriesFor(name) {
  const source = resolve(root, "packages", name, "src");
  if (name !== "charts") return { index: resolve(source, "index.ts") };

  const entries = { index: resolve(source, "index.ts") };
  for (const item of readdirSync(source, { withFileTypes: true })) {
    if (!item.isDirectory() || !/^[A-Z]\d{2}-/.test(item.name)) continue;
    entries[`${item.name}/index`] = resolve(source, item.name, "index.tsx");
  }
  return entries;
}

for (const name of packageNames) {
  const packageRoot = resolve(root, "packages", name);
  const dist = resolve(packageRoot, "dist");
  rmSync(dist, { recursive: true, force: true });

  await build({
    configFile: false,
    root: packageRoot,
    publicDir: false,
    logLevel: "warn",
    build: {
      outDir: dist,
      emptyOutDir: false,
      sourcemap: true,
      minify: false,
      lib: { entry: entriesFor(name), formats: ["es"] },
      rollupOptions: {
        external,
        output: {
          entryFileNames: "[name].js",
          chunkFileNames: "chunks/[name]-[hash].js",
        },
      },
    },
  });

  execFileSync(
    process.execPath,
    [resolve(root, "node_modules", "typescript", "bin", "tsc"), "-p", resolve(packageRoot, "tsconfig.build.json")],
    { cwd: root, stdio: "inherit" },
  );

  if (name === "charts") {
    for (const item of readdirSync(resolve(packageRoot, "src"), { withFileTypes: true })) {
      if (!item.isDirectory() || !/^[A-Z]\d{2}-/.test(item.name)) continue;
      const readme = resolve(packageRoot, "src", item.name, "README.md");
      if (!existsSync(readme)) continue;
      const target = resolve(dist, item.name, "README.md");
      mkdirSync(resolve(dist, item.name), { recursive: true });
      cpSync(readme, target);
    }
  }
}
