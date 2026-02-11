import {
  and,
  asc,
  eq,
  inArray,
  isNull,
  lt,
  or,
} from "drizzle-orm";

import { ProductMetric, type ProductMetricRepository } from "@domain/product";
import { db } from "@infrastructure/db/postgres/client";
import { productMetrics } from "@infrastructure/db/postgres/schema";

const mapRowToProductMetric = (
  row: typeof productMetrics.$inferSelect,
): ProductMetric =>
  ProductMetric.create({
    productId: row.productId,
    viewsCount: row.viewsCount,
    cartAddsCount: row.cartAddsCount,
    reviewsCount: row.reviewsCount,
    ratingSum: row.ratingSum,
    ratingCount: row.ratingCount,
    popularityScore: Number(row.popularityScore),
    popularityDirty: row.popularityDirty,
    popularityLastCalculatedAt: row.popularityLastCalculatedAt ?? undefined,
    popularityNextRecalcAt: row.popularityNextRecalcAt ?? undefined,
  });

export class PgProductMetricRepository implements ProductMetricRepository {
  public async findByProducts(
    productIds: number[],
  ): Promise<ProductMetric[]> {
    if (productIds.length === 0) {
      return [];
    }

    const rows = await db
      .select()
      .from(productMetrics)
      .where(inArray(productMetrics.productId, productIds));

    return rows.map(mapRowToProductMetric);
  }

  public async findDirtyForRecalc(limit: number): Promise<ProductMetric[]> {
    const now = new Date();

    const rows = await db
      .select()
      .from(productMetrics)
      .where(
        and(
          eq(productMetrics.popularityDirty, true),
          or(
            isNull(productMetrics.popularityNextRecalcAt),
            lt(productMetrics.popularityNextRecalcAt, now),
            isNull(productMetrics.popularityLastCalculatedAt),
            lt(productMetrics.popularityLastCalculatedAt, now),
          ),
        ),
      )
      .orderBy(asc(productMetrics.popularityNextRecalcAt))
      .limit(limit);

    return rows.map(mapRowToProductMetric);
  }

  public async update(metric: ProductMetric): Promise<void> {
    await db
      .update(productMetrics)
      .set({
        viewsCount: metric.viewsCount,
        cartAddsCount: metric.cartAddsCount,
        reviewsCount: metric.reviewsCount,
        ratingSum: metric.ratingSum,
        ratingCount: metric.ratingCount,
        popularityScore: metric.popularityScore.toString(),
        popularityDirty: metric.popularityDirty,
        popularityLastCalculatedAt: metric.popularityLastCalculatedAt,
        popularityNextRecalcAt: metric.popularityNextRecalcAt,
      })
      .where(eq(productMetrics.productId, metric.productId));
  }
}


