import type { UserProductEvent } from './user-product-event.entity'

export interface UserProductEventRepository {
  create: (event: UserProductEvent) => Promise<void>
}

export const USER_PRODUCT_EVENT_REPOSITORY_TOKEN = Symbol.for(
  'UserProductEventRepository',
)
