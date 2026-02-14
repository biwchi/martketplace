import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'

import { drizzleCommonConfig, pgConfig } from './db.config'
import * as schema from './schema'

const pool = new Pool({
  connectionString: pgConfig.connectionString,
  database: pgConfig.database,
})

export const db = drizzle(pool, {
  schema,
  casing: drizzleCommonConfig.casing,
})
