import type { RefreshTokenRepository } from '@domain/auth'
import type {
  CategoryAttributeRepository,
  CategoryRepository,
} from '@domain/category'
import type {
  ProductAttributeValueRepository,
  ProductMetricRepository,
  ProductRepository,
  UserProductEventRepository,
} from '@domain/product'
import type { SellerRepository } from '@domain/seller'
import type {
  PreferencesProfileRepository,
  UserRepository,
} from '@domain/user'
import { REFRESH_TOKEN_REPOSITORY_TOKEN } from '@domain/auth'
import {
  CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN,
  CATEGORY_REPOSITORY_TOKEN,
} from '@domain/category'
import {
  PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,
  PRODUCT_METRIC_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
  USER_PRODUCT_EVENT_REPOSITORY_TOKEN,
} from '@domain/product'
import { SELLER_REPOSITORY_TOKEN } from '@domain/seller'
import {
  PREFERENCES_PROFILE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from '@domain/user'
import {
  PgCategoryAttributeRepository,
  PgCategoryRepository,
  PgPreferencesProfileRepository,
  PgProductAttributeValueRepository,
  PgProductMetricRepository,
  PgProductRepository,
  PgRefreshTokenRepository,
  PgSellerRepository,
  PgUserProductEventRepository,
  PgUserRepository,
} from '@infrastructure/db/postgres/repositories'
import { container } from 'bootstrap/container'

export function configureRepositories() {
  // User
  container
    .bind<UserRepository>(USER_REPOSITORY_TOKEN)
    .to(PgUserRepository)
    .inSingletonScope()

  container
    .bind<PreferencesProfileRepository>(PREFERENCES_PROFILE_REPOSITORY_TOKEN)
    .to(PgPreferencesProfileRepository)
    .inSingletonScope()

  // Product
  container
    .bind<ProductRepository>(PRODUCT_REPOSITORY_TOKEN)
    .to(PgProductRepository)
    .inSingletonScope()

  container
    .bind<ProductMetricRepository>(PRODUCT_METRIC_REPOSITORY_TOKEN)
    .to(PgProductMetricRepository)
    .inSingletonScope()

  container
    .bind<ProductAttributeValueRepository>(
      PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,
    )
    .to(PgProductAttributeValueRepository)
    .inSingletonScope()

  container
    .bind<UserProductEventRepository>(USER_PRODUCT_EVENT_REPOSITORY_TOKEN)
    .to(PgUserProductEventRepository)
    .inSingletonScope()

  // Category
  container
    .bind<CategoryRepository>(CATEGORY_REPOSITORY_TOKEN)
    .to(PgCategoryRepository)
    .inSingletonScope()

  container
    .bind<CategoryAttributeRepository>(CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN)
    .to(PgCategoryAttributeRepository)
    .inSingletonScope()

  // Seller
  container
    .bind<SellerRepository>(SELLER_REPOSITORY_TOKEN)
    .to(PgSellerRepository)
    .inSingletonScope()

  // Auth
  container
    .bind<RefreshTokenRepository>(REFRESH_TOKEN_REPOSITORY_TOKEN)
    .to(PgRefreshTokenRepository)
    .inSingletonScope()
}
