import type { UserProductEventRepository } from '@domain/product'
import { UserProductEvent } from '@domain/product'
import { db } from '@infrastructure/db/postgres/client'
import { userProductEvents } from '@infrastructure/db/postgres/schema'

function mapRowToUserProductEvent(row: typeof userProductEvents.$inferSelect): UserProductEvent {
  return UserProductEvent.create({
    id: row.id,
    userId: row.userId ?? undefined,
    visitorId: row.visitorId,
    productId: row.productId,
    categoryId: row.categoryId,
    eventType: row.eventType as UserProductEvent['eventType'],
  })
}

export class PgUserProductEventRepository implements UserProductEventRepository {
  public async create(event: UserProductEvent): Promise<void> {
    const [row] = await db
      .insert(userProductEvents)
      .values({
        userId: event.userId ?? null,
        visitorId: event.visitorId,
        productId: event.productId,
        categoryId: event.categoryId,
        eventType: event.eventType,
      })
      .returning()

    if (!row) {
      throw new Error('Failed to create user product event')
    }

    // Ensure we can map back (helps catch schema drift early)
    mapRowToUserProductEvent(row)
  }
}
