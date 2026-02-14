import { integer, timestamp } from 'drizzle-orm/pg-core'

export function identity() {
  return integer().primaryKey().generatedAlwaysAsIdentity()
}

export function timestamps() {
  return {
    createdAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp({ withTimezone: true })
      .notNull()
      .defaultNow(),
  }
}
