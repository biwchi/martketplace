const DEFAULT_DATABASE_URL
  = 'postgres://postgres:postgres@localhost:5432/postgres'

export const pgConfig = {
  connectionString: Bun.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  database: Bun.env.PGDATABASE ?? 'postgres',
} as const

export const drizzleCommonConfig = {
  casing: 'snake_case' as const,
} as const

export const drizzleKitConfig = {
  schema: './src/infrastructure/db/postgres/schema',
  out: './drizzle',
} as const
