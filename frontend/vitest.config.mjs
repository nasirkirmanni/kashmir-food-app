import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Resolves the "@/…" imports that jsconfig.json maps for Next, so tests can import app code
// such as app/sitemap.js.
export default defineConfig({
  // App files are .js with JSX in them (components/JsonLd.js holds both the schema builders and a
  // component), so tests read .js as JSX too.
  esbuild: { include: /\.jsx?$/, exclude: [], loader: "jsx", jsx: "automatic" },
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
