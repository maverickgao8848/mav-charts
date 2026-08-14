import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: process.env.GITHUB_PAGES === "true" ? "/mav-charts/" : "/",
  plugins: [react()],
  server: {
    port: 4173,
    strictPort: true,
  },
});
