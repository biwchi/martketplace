/** Props required to create or hold product metrics. One row per product (productId is PK). */
export interface CreateProductMetricProps {
  productId: number
  viewsCount: number
  cartAddsCount: number
  reviewsCount: number
  ratingSum: number
  ratingCount: number
  popularityScore: number
  popularityDirty?: boolean
  popularityLastCalculatedAt?: Date
  popularityNextRecalcAt?: Date
}

export interface ProductMetricProps extends CreateProductMetricProps { }
export type ProductMetricIncrementableColumn = 'viewsCount' | 'cartAddsCount' | 'reviewsCount' | 'ratingSum' | 'ratingCount'

function validateProductMetricData(data: CreateProductMetricProps): void {
  if (data.productId <= 0) {
    throw new Error('ProductMetric productId must be positive')
  }
  if (data.viewsCount < 0 || data.cartAddsCount < 0 || data.reviewsCount < 0) {
    throw new Error('ProductMetric counts must be non-negative')
  }
  if (data.ratingSum < 0 || data.ratingCount < 0) {
    throw new Error('ProductMetric ratingSum and ratingCount must be non-negative')
  }
}

export class ProductMetric {
  public readonly productId: number
  public readonly viewsCount: number
  public readonly cartAddsCount: number
  public readonly reviewsCount: number
  public readonly ratingSum: number
  public readonly ratingCount: number
  public readonly popularityScore: number
  public readonly popularityDirty: boolean
  public readonly popularityLastCalculatedAt: Date | null
  public readonly popularityNextRecalcAt: Date | null

  private constructor(props: ProductMetricProps) {
    this.productId = props.productId
    this.viewsCount = props.viewsCount
    this.cartAddsCount = props.cartAddsCount
    this.reviewsCount = props.reviewsCount
    this.ratingSum = props.ratingSum
    this.ratingCount = props.ratingCount
    this.popularityScore = props.popularityScore
    this.popularityDirty = props.popularityDirty ?? false
    this.popularityLastCalculatedAt = props.popularityLastCalculatedAt ?? null
    this.popularityNextRecalcAt = props.popularityNextRecalcAt ?? null
  }

  static create(props: CreateProductMetricProps): ProductMetric {
    validateProductMetricData(props)
    return new ProductMetric(props)
  }

  /** Average rating (0 when there are no reviews). */
  get averageRating(): number {
    return this.ratingCount === 0 ? 0 : this.ratingSum / this.ratingCount
  }

  /**
   * Computes popularity score from current counts and rating.
   * Formula: 0.4 * rating_avg + 0.2 * log(reviews+1) + 0.2 * log(cart_adds+1) + 0.2 * log(views+1).
   */
  private calculatePopularityScore(metric: ProductMetric): number {
    const ratingAvg = metric.averageRating
    return (
      0.4 * ratingAvg
      + 0.2 * Math.log(metric.reviewsCount + 1)
      + 0.2 * Math.log(metric.cartAddsCount + 1)
      + 0.2 * Math.log(metric.viewsCount + 1)
    )
  }

  /**
   * Returns a new ProductMetric with recalculated popularityScore, popularityDirty false,
   * and the given last-calculated and next-recalc timestamps.
   */
  public withRecalculatedPopularity(
    lastCalculatedAt: Date,
    nextRecalcAt: Date,
  ): ProductMetric {
    return ProductMetric.create({
      productId: this.productId,
      viewsCount: this.viewsCount,
      cartAddsCount: this.cartAddsCount,
      reviewsCount: this.reviewsCount,
      ratingSum: this.ratingSum,
      ratingCount: this.ratingCount,
      popularityScore: this.calculatePopularityScore(this),
      popularityDirty: false,
      popularityLastCalculatedAt: lastCalculatedAt,
      popularityNextRecalcAt: nextRecalcAt,
    })
  }
}
