import { sql } from 'drizzle-orm'

import { check, integer, numeric, pgTable, timestamp, varchar } from 'drizzle-orm/pg-core'
import { users } from './user.schema'

export const preferencesProfile = pgTable('preferences_profile', {
  userId: integer().references(() => users.id, { onDelete: 'cascade' }),
  visitorId: varchar(),
  topCategoryIds: integer().array().notNull(),
  preferredAveragePrice: numeric().notNull(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
}, t => [
  check(
    'userId_or_visitorId',
    sql`(${t.userId} IS NOT NULL AND ${t.visitorId} IS NULL) OR (${t.userId} IS NULL AND ${t.visitorId} IS NOT NULL)`,
  ),
])
