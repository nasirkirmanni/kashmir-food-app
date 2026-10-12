import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

// Resolves the "@/…" imports that jsconfig.json maps for Next, so tests can import app code
// such as app/sitemap.js.
export default defineConfig({
  resolve: {
    alias: { "@": fileURLToPath(new URL(".", import.meta.url)) },
  },
});
