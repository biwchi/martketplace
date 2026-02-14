import type { Product } from './product.entity'

export interface RecentlyViewedProductsQueryOptions {
  userId: number
  limit: number
}

export interface PopularProductsQueryOptions {
  /** User ID to personalize the results. */
  userId?: number
  visitorId?: string
  limit: number
}

export interface PopularProductsPriceMatchedQueryOptions extends PopularProductsQueryOptions {
  priceBucket: number
}

export interface PopularProductsByCategoriesQueryOptions extends PopularProductsQueryOptions {
  byCategoryIds: number[]
}

interface BanProductsForVisitorOptions {
  userId?: number
  visitorId: string
  productIds: number[]
  banUntil: Date
}

export interface ProductRepository {
  findById: (id: number) => Promise<Product | null>
  create: (product: Product) => Promise<Product>
  update: (product: Product) => Promise<Product>
  delete: (id: number) => Promise<void>

  /**
   * Returns popular products for the user, filtering out those the user has already seen.
   */
  findPopularProducts: (options: PopularProductsQueryOptions) => Promise<Product[]>
  findPopularPriceMatchedProducts: (options: PopularProductsPriceMatchedQueryOptions) => Promise<Product[]>
  findPopularProductsByCategories: (options: PopularProductsByCategoriesQueryOptions) => Promise<Product[]>
  findRecentlyViewedProducts: (options: RecentlyViewedProductsQueryOptions) => Promise<Product[]>

  /**
   * Bans products for a visitor, preventing them from being shown in the feed for a certain period of time.
   */
  banProductsForVisitor: (options: BanProductsForVisitorOptions) => Promise<void>
}

export const PRODUCT_REPOSITORY_TOKEN = Symbol.for('ProductRepository')
