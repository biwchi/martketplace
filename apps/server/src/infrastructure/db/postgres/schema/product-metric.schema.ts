import { boolean, integer, numeric, pgTable, timestamp } from 'drizzle-orm/pg-core'

import { products } from './product.schema'

export const productMetrics = pgTable('product_metrics', {
  productId: integer()
    .primaryKey()
    .references(() => products.id, { onDelete: 'cascade' }),
  viewsCount: integer().notNull(),
  cartAddsCount: integer().notNull(),
  reviewsCount: integer().notNull(),
  ratingSum: integer().notNull(),
  ratingCount: integer().notNull(),
  popularityScore: numeric().notNull(),
  popularityDirty: boolean().notNull().default(true),
  popularityLastCalculatedAt: timestamp({ withTimezone: true }),
  popularityNextRecalcAt: timestamp({ withTimezone: true }),
})
