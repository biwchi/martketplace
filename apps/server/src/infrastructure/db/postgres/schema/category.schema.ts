import { integer, pgTable, varchar } from 'drizzle-orm/pg-core'

import { identity, timestamps } from './schema.utils'

export const categories = pgTable('categories', {
  id: identity(),
  name: varchar().notNull(),
  slug: varchar().notNull(),
  iconName: varchar(),
  parentId: integer(),
  ...timestamps(),
})
