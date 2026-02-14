import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'

import { identity, timestamps } from './schema.utils'
import { users } from './user.schema'

export const sellers = pgTable('sellers', {
  id: identity(),
  userId: integer()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: varchar().notNull(),
  status: varchar({ enum: ['pending', 'active', 'suspended'] }).notNull(),
  ...timestamps(),
})
