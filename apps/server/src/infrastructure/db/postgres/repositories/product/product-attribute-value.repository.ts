import type {
  ProductAttributeValueRepository,
  ProductAttributeValueRow,
} from '@domain/product'

import { db } from '@infrastructure/db/postgres/client'
import { productAttributeValues } from '@infrastructure/db/postgres/schema'
import { eq } from 'drizzle-orm'

export class PgProductAttributeValueRepository
implements ProductAttributeValueRepository {
  public async replaceForProduct(
    productId: number,
    values: ProductAttributeValueRow[],
  ): Promise<void> {
    await db.transaction(async (tx) => {
      await tx
        .delete(productAttributeValues)
        .where(eq(productAttributeValues.productId, productId))

      if (values.length === 0) {
        return
      }

      await tx.insert(productAttributeValues).values(
        values.map(value => ({
          productId,
          categoryAttributeId: value.categoryAttributeId,
          value: value.value,
        })),
      )
    })
  }
}
