import { pgTable, varchar } from 'drizzle-orm/pg-core'

import { identity, timestamps } from './schema.utils'

export const users = pgTable('users', {
  id: identity(),
  email: varchar().notNull(),
  passwordHash: varchar().notNull(),
  ...timestamps(),
})
