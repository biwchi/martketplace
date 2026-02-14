import { integer, jsonb, pgTable } from 'drizzle-orm/pg-core'

import { categoryAttributes } from './category-attribute.schema'
import { products } from './product.schema'

export const productAttributeValues = pgTable('product_attribute_values', {
  productId: integer()
    .notNull()
    .references(() => products.id, { onDelete: 'cascade' }),
  categoryAttributeId: integer()
    .notNull()
    .references(() => categoryAttributes.id, { onDelete: 'cascade' }),
  value: jsonb().notNull(),
})
