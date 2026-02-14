import { boolean, integer, pgTable, varchar } from 'drizzle-orm/pg-core'

import { categories } from './category.schema'
import { identity, timestamps } from './schema.utils'

export const categoryAttributes = pgTable('category_attributes', {
  id: identity(),
  categoryId: integer()
    .notNull()
    .references(() => categories.id, { onDelete: 'cascade' }),
  code: varchar().notNull(),
  name: varchar().notNull(),
  dataType: varchar({
    enum: [
      'string',
      'number',
      'color',
      'select',
      'boolean',
    ],
  }).notNull(),
  isRequired: boolean().notNull().default(false),
  options: varchar().array(),
  ...timestamps(),
})
