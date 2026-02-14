import { integer, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'

import { identity, timestamps } from './schema.utils'
import { users } from './user.schema'

export const refreshTokens = pgTable('refresh_tokens', {
  id: identity(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar().notNull(),
  expiresAt: timestamp({ withTimezone: true }).notNull(),
  ...timestamps(),
})
