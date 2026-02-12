import "reflect-metadata";

import { Container } from "inversify";

import type {
  CategoryAttributeRepository,
  CategoryRepository,
} from "@domain/category";
import {
  CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN,
  CATEGORY_REPOSITORY_TOKEN,
} from "@domain/category";
import type {
  ProductAttributeValueRepository,
  ProductMetricRepository,
  ProductRepository,
  UserProductEventRepository,
} from "@domain/product";
import {
  PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,
  PRODUCT_METRIC_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  USER_PRODUCT_EVENT_REPOSITORY_TOKEN,
} from "@domain/product";
import type { RefreshTokenRepository } from "@domain/auth";
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from "@domain/auth";
import type { SellerRepository } from "@domain/seller";
import { SELLER_REPOSITORY_TOKEN } from "@domain/seller";
import type {
  PreferencesProfileRepository,
  UserRepository,
} from "@domain/user";
import {
  PREFERENCES_PROFILE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from "@domain/user";
import type { CachePort } from "@application/ports";
import { CACHE_PORT_TOKEN } from "@application/ports";
import {
  PgCategoryAttributeRepository,
  PgCategoryRepository,
  PgProductAttributeValueRepository,
  PgProductMetricRepository,
  PgProductRepository,
  PgUserProductEventRepository,
  PgRefreshTokenRepository,
  PgSellerRepository,
  PgPreferencesProfileRepository,
  PgUserRepository,
} from "@infrastructure/db/postgres/repositories";
import { RedisCacheAdapter } from "@infrastructure/db/redis/cache.adapter";

/**
 * Single, shared Inversify container for the backend.
 *
 * This is the *composition root*: the only place where we wire
 * together domain/application interfaces (ports) with concrete
 * infrastructure implementations (adapters).
 *
 * All other layers use the exported `container` to resolve
 * dependencies by *interface type*, not by concrete class.
 */
export const container = new Container({
  defaultScope: "Transient",
});

/**
 * Bind all implemented repositories.
 *
 * The pattern is always:
 *
 * - bind the *interface type* (e.g. `UserRepository`)
 * - to a concrete implementation class (e.g. `PgUserRepository`)
 *
 * Because TypeScript interfaces are erased at runtime, we use
 * the interface *constructor function* (coming from `@domain/*`
 * barrels) as the runtime token for Inversify.
 */
export function configureContainer(): Container {
  // Application ports
  container
    .bind<CachePort>(CACHE_PORT_TOKEN)
    .to(RedisCacheAdapter)
    .inSingletonScope();

  // User
  container
    .bind<UserRepository>(USER_REPOSITORY_TOKEN)
    .to(PgUserRepository)
    .inSingletonScope();

  container
    .bind<PreferencesProfileRepository>(PREFERENCES_PROFILE_REPOSITORY_TOKEN)
    .to(PgPreferencesProfileRepository)
    .inSingletonScope();

  // Product
  container
    .bind<ProductRepository>(PRODUCT_REPOSITORY_TOKEN)
    .to(PgProductRepository)
    .inSingletonScope();

  container
    .bind<ProductMetricRepository>(PRODUCT_METRIC_REPOSITORY_TOKEN)
    .to(PgProductMetricRepository)
    .inSingletonScope();

  container
    .bind<ProductAttributeValueRepository>(
      PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,
    )
    .to(PgProductAttributeValueRepository)
    .inSingletonScope();

  container
    .bind<UserProductEventRepository>(USER_PRODUCT_EVENT_REPOSITORY_TOKEN)
    .to(PgUserProductEventRepository)
    .inSingletonScope();

  // Category
  container
    .bind<CategoryRepository>(CATEGORY_REPOSITORY_TOKEN)
    .to(PgCategoryRepository)
    .inSingletonScope();

  container
    .bind<CategoryAttributeRepository>(CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN)
    .to(PgCategoryAttributeRepository)
    .inSingletonScope();

  // Seller
  container
    .bind<SellerRepository>(SELLER_REPOSITORY_TOKEN)
    .to(PgSellerRepository)
    .inSingletonScope();

  // Auth
  container
    .bind<RefreshTokenRepository>(REFRESH_TOKEN_REPOSITORY_TOKEN)
    .to(PgRefreshTokenRepository)
    .inSingletonScope();

  return container;
}

