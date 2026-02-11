import { defineConfig } from "drizzle-kit";

import { drizzleCommonConfig, drizzleKitConfig, pgConfig } from "./db.config";

export default defineConfig({
  dialect: "postgresql",
  schema: drizzleKitConfig.schema,
  out: drizzleKitConfig.out,
  casing: drizzleCommonConfig.casing,
  dbCredentials: {
    url: pgConfig.connectionString,
  },
});

