import type { ProductMetricRepository } from '@domain/product'
import {
  PRODUCT_METRIC_REPOSITORY_TOKEN,

} from '@domain/product'

import { inject, injectable } from 'inversify'

const RECALC_BATCH_LIMIT = 1000
const NEXT_RECALC_MS = 10 * 60 * 1000 // 10 minutes

@injectable()
export class RecalculateDirtyProductsPopularity {
  constructor(
    @inject(PRODUCT_METRIC_REPOSITORY_TOKEN)
    private readonly productMetricRepository: ProductMetricRepository,
  ) { }

  async execute(): Promise<{ recalculated: number }> {
    const now = new Date()
    const nextRecalcAt = new Date(now.getTime() + NEXT_RECALC_MS)

    const dirty = await this.productMetricRepository.findDirtyForRecalc(
      RECALC_BATCH_LIMIT,
    )

    for (const metric of dirty) {
      await this.productMetricRepository.update(
        metric.withRecalculatedPopularity(now, nextRecalcAt),
      )
    }

    return { recalculated: dirty.length }
  }
}
