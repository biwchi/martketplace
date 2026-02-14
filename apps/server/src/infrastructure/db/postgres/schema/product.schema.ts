import { integer, numeric, pgTable, text, varchar } from 'drizzle-orm/pg-core'

import { categories } from './category.schema'
import { identity, timestamps } from './schema.utils'
import { sellers } from './seller.schema'

export const products = pgTable('products', {
  id: identity(),
  sellerId: integer().notNull().references(() => sellers.id),
  categoryId: integer()
    .notNull()
    .references(() => categories.id),
  name: varchar().notNull(),
  description: text().notNull(),
  price: numeric().notNull(),
  slug: varchar().notNull(),
  status: varchar({ enum: ['draft', 'active'] }).notNull(),
  ...timestamps(),
})
