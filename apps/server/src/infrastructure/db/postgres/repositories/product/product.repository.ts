import { eq } from "drizzle-orm";

import type {
  ProductRepository,
  PopularProductsByCategoriesQueryOptions,
  PopularProductsPriceMatchedQueryOptions,
  PopularProductsQueryOptions,
  RecentlyViewedProductsQueryOptions,
} from "@domain/product";
import { Product } from "@domain/product";
import { db } from "@infrastructure/db/postgres/client";
import { products } from "@infrastructure/db/postgres/schema";

const mapRowToProduct = (row: typeof products.$inferSelect): Product =>
  Product.create({
    id: row.id,
    sellerId: row.sellerId,
    categoryId: row.categoryId,
    name: row.name,
    description: row.description,
    price: Number(row.price),
    slug: row.slug,
    status: row.status
  });

export class PgProductRepository implements ProductRepository {
  public async findById(id: number): Promise<Product | null> {
    const [row] = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return mapRowToProduct(row);
  }

  public async create(product: Product): Promise<Product> {
    const [row] = await db
      .insert(products)
      .values({
        sellerId: product.sellerId,
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        slug: product.slug,
        status: product.status,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create product");
    }

    return mapRowToProduct(row);
  }

  public async update(product: Product): Promise<Product> {
    const [row] = await db
      .update(products)
      .set({
        sellerId: product.sellerId,
        categoryId: product.categoryId,
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        slug: product.slug,
        status: product.status,
      })
      .where(eq(products.id, product.id))
      .returning();

    if (!row) {
      throw new Error("Failed to update product");
    }

    return mapRowToProduct(row);
  }

  public async delete(id: number): Promise<void> {
    await db.delete(products).where(eq(products.id, id));
  }

  public async findPopularProducts(
    options: PopularProductsQueryOptions,
  ): Promise<Product[]> {
    throw new Error("PgProductRepository.findPopularProducts not implemented");
  }

  public async findPopularPriceMatchedProducts(
    options: PopularProductsPriceMatchedQueryOptions,
  ): Promise<Product[]> {
    throw new Error(
      "PgProductRepository.findPopularPriceMatchedProducts not implemented",
    );
  }

  public async findPopularProductsByCategories(
    options: PopularProductsByCategoriesQueryOptions,
  ): Promise<Product[]> {
    throw new Error(
      "PgProductRepository.findPopularProductsByCategories not implemented",
    );
  }

  public async findRecentlyViewedProducts(
    options: RecentlyViewedProductsQueryOptions,
  ): Promise<Product[]> {
    throw new Error(
      "PgProductRepository.findRecentlyViewedProducts not implemented",
    );
  }

  public async banProductsForVisitor(): Promise<void> {
    throw new Error("PgProductRepository.banProductsForVisitor not implemented");
  }
}

