import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  resolve: {
    alias: {
      "@domain": path.resolve(dirname, "src/domain"),
      "@application": path.resolve(dirname, "src/application"),
      "@shared": path.resolve(dirname, "src/shared"),
      "@infrastructure": path.resolve(dirname, "src/infrastructure"),
    },
  },
});
