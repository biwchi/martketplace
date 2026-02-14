import type { ProductMetric, ProductMetricIncrementableColumn } from './product-metric.entity'

export interface ProductMetricRepository {
  findByProducts: (productIds: number[]) => Promise<ProductMetric[]>
  /**
   * Returns metrics that are due for popularity recalc: popularityDirty is true
   * and (popularityNextRecalcAt < now or popularityLastCalculatedAt < now).
   */
  findDirtyForRecalc: (limit: number) => Promise<ProductMetric[]>
  increment: (productId: number, column: ProductMetricIncrementableColumn) => Promise<void>
  update: (metric: ProductMetric) => Promise<void>
}

export const PRODUCT_METRIC_REPOSITORY_TOKEN = Symbol.for(
  'ProductMetricRepository',
)
