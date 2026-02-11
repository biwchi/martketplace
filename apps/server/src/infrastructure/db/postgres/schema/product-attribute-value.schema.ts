import { integer, jsonb, pgTable } from "drizzle-orm/pg-core";

import { products } from "./product.schema";
import { categoryAttributes } from "./category-attribute.schema";

export const productAttributeValues = pgTable("product_attribute_values", {
  productId: integer()
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  categoryAttributeId: integer()
    .notNull()
    .references(() => categoryAttributes.id, { onDelete: "cascade" }),
  value: jsonb().notNull(),
});

