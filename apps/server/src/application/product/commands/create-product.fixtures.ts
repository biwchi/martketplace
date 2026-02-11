import { vi } from "vitest";
import { User } from "@domain/user";
import { Seller } from "@domain/seller";
import { Product } from "@domain/product";
import type { UserRepository } from "@domain/user";
import type { SellerRepository } from "@domain/seller";
import type { ProductRepository } from "@domain/product";
import type {
  CategoryAttributeRepository,
  CategoryRepository,
} from "@domain/category";
import { Category } from "@domain/category";
import type { ProductAttributeValueRepository } from "@domain/product";
import type { CreateProductInputDto, CreateProductProductDto } from "../product.dto";
import {
  createDefaultCategoryAttributes,
  createProductAttributeInput,
  AttributeId,
  SelectOptions,
  FixtureCategoryId,
} from "../product-attributes.validator.fixtures";

/** Stable IDs for tests. Use instead of magic numbers. */
export const FixtureIds = {
  UserId: 100,
  SellerId: 1,
  CategoryId: FixtureCategoryId,
  /** ID returned by productRepository.create in mocks (simulates DB-assigned id). */
  CreatedProductId: 42,
} as const;

const now = new Date();

const defaultProduct = {
  categoryId: FixtureIds.CategoryId,
  name: "Fixture Product",
  description: "Fixture description",
  price: 9.99,
  slug: "fixture-slug",
  status: undefined as CreateProductInputDto["product"]["status"],
  attributes: [
    createProductAttributeInput(AttributeId.RequiredString, "Cotton"),
    createProductAttributeInput(AttributeId.RequiredSelect, SelectOptions[1]),
  ],
};


type CreateProductInputOverrides = Partial<Omit<CreateProductInputDto, "product">> & {
  product?: Partial<CreateProductProductDto>
};
/** Build CreateProductInputDto with defaults. Override any field to extend. */
export function createCreateProductInput(
  overrides: CreateProductInputOverrides = {},
): CreateProductInputDto {
  const product = { ...defaultProduct, ...overrides.product };
  return {
    userId: overrides.userId ?? FixtureIds.UserId,
    product: {
      ...product,
      categoryId: product.categoryId ?? defaultProduct.categoryId,
      name: product.name ?? defaultProduct.name,
      description: product.description ?? defaultProduct.description,
      price: product.price ?? defaultProduct.price,
      slug: product.slug ?? defaultProduct.slug,
      attributes: product.attributes ?? defaultProduct.attributes,
    },
  };
}

/** Build a User for repository mocks. */
export function createFixtureUser(
  overrides: Partial<Parameters<typeof User.create>[0]> & Pick<Parameters<typeof User.create>[0], "id">,
): User {
  return User.create({
    id: overrides.id,
    email: overrides.email ?? "seller@example.com",
    passwordHash: overrides.passwordHash ?? "hash",
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  });
}

/** Build a Seller for repository mocks. */
export function createFixtureSeller(
  overrides: Partial<Parameters<typeof Seller.create>[0]> & Pick<Parameters<typeof Seller.create>[0], "id" | "userId">,
): Seller {
  return Seller.create({
    id: overrides.id ?? FixtureIds.SellerId,
    userId: overrides.userId ?? FixtureIds.UserId,
    name: overrides.name ?? "Fixture Shop",
    status: overrides.status ?? "active",
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  });
}

/** Build a Category for repository mocks. */
export function createFixtureCategory(
  overrides: Partial<Parameters<typeof Category.create>[0]> & {
    id: number;
  } = { id: FixtureIds.CategoryId },
): Category {
  return Category.create({
    id: overrides.id ?? FixtureIds.CategoryId,
    name: overrides.name ?? "Fixture Category",
    slug: overrides.slug ?? "fixture-category",
    iconName: overrides.iconName ?? "folder",
    parentId: overrides.parentId ?? null,
  });
}

/** Build the Product as returned by productRepository.create (with persisted id). */
export function createFixtureProduct(
  overrides: Partial<Parameters<typeof Product.create>[0]> & { id: number },
): Product {
  return Product.create({
    id: overrides.id ?? FixtureIds.CreatedProductId,
    sellerId: overrides.sellerId ?? FixtureIds.SellerId,
    categoryId: overrides.categoryId ?? FixtureIds.CategoryId,
    name: overrides.name ?? "Fixture Product",
    description: overrides.description ?? "Fixture description",
    price: overrides.price ?? 9.99,
    slug: overrides.slug ?? "fixture-slug",
    status: overrides.status ?? "draft",
  });
}

/** Create mock repositories with success defaults. Override methods in tests as needed. */
export function createMockRepositories(): {
  userRepository: UserRepository;
  sellerRepository: SellerRepository;
  productRepository: ProductRepository;
  categoryRepository: CategoryRepository;
  categoryAttributeRepository: CategoryAttributeRepository;
  productAttributeValueRepository: ProductAttributeValueRepository;
} {
  const user = createFixtureUser({ id: FixtureIds.UserId });
  const seller = createFixtureSeller({
    id: FixtureIds.SellerId,
    userId: FixtureIds.UserId,
  });
  const category = createFixtureCategory({ id: FixtureIds.CategoryId });
  const categoryAttributes = createDefaultCategoryAttributes();

  return {
    userRepository: {
      findById: vi.fn().mockResolvedValue(user),
      findByEmail: vi.fn(),
    },
    sellerRepository: {
      findByUserId: vi.fn().mockResolvedValue(seller),
    },
    productRepository: {
      findById: vi.fn(),
      findPopularProducts: vi.fn(),
      findPopularPriceMatchedProducts: vi.fn(),
      findPopularProductsByCategories: vi.fn(),
      findRecentlyViewedProducts: vi.fn(),
      banProductsForVisitor: vi.fn(),
      create: vi.fn().mockImplementation((product: Product) => {
        const created = createFixtureProduct({
          id: FixtureIds.CreatedProductId,
          sellerId: product.sellerId,
          categoryId: product.categoryId,
          name: product.name,
          description: product.description,
          price: product.price,
          slug: product.slug,
          status: product.status,
        });
        return Promise.resolve(created);
      }),
      update: vi.fn(),
      delete: vi.fn(),
    },
    categoryRepository: {
      findById: vi.fn().mockResolvedValue(category),
    },
    categoryAttributeRepository: {
      findByCategoryId: vi.fn().mockResolvedValue(categoryAttributes),
    },
    productAttributeValueRepository: {
      replaceForProduct: vi.fn().mockResolvedValue(undefined),
    },
  };
}
