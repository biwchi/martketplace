import { integer, pgTable, varchar } from "drizzle-orm/pg-core";

import { identity, timestamps } from "./schema.utils";
import { products } from "./product.schema";
import { users } from "./user.schema";

export const userProductEvents = pgTable("user_product_events", {
  id: identity(),
  userId: integer()
    .references(() => users.id),
  visitorId: varchar().notNull(),
  productId: integer()
    .notNull()
    .references(() => products.id),
  categoryId: integer().notNull(),
  eventType: varchar({ enum: ["view", "cart_add", "favorite"] }).notNull(),
  ...timestamps(),
});

