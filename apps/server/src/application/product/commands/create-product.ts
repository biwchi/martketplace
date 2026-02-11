import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Result, err, ok } from "neverthrow";

import type {
  CategoryAttributeRepository,
  CategoryRepository,
} from "@domain/category";
import {
  CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN,
  CATEGORY_REPOSITORY_TOKEN,
} from "@domain/category";
import { NEW_ENTITY_ID } from "@domain/common";
import type {
  ProductAttributeValueRepository,
  ProductRepository,
} from "@domain/product";
import {
  Product,
  PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
} from "@domain/product";
import {
  type UserRepository,
  USER_REPOSITORY_TOKEN,
} from "@domain/user";
import {
  type SellerRepository,
  SELLER_REPOSITORY_TOKEN,
} from "@domain/seller";

import type { CreateProductInputDto } from "../product.dto";
import {
  validateProductAttributes,
  type InvalidProductAttributesError,
} from "../product-attributes.validator";

export type CreateProductError =
  | { reason: "user-not-found" }
  | { reason: "user-not-seller" }
  | { reason: "category-not-found" }
  | { reason: "invalid-product-attributes"; error: InvalidProductAttributesError };

@injectable()
export class CreateProduct {
  constructor(
    @inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @inject(SELLER_REPOSITORY_TOKEN)
    private readonly sellerRepository: SellerRepository,
    @inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: ProductRepository,
    @inject(CATEGORY_REPOSITORY_TOKEN)
    private readonly categoryRepository: CategoryRepository,
    @inject(CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN)
    private readonly categoryAttributeRepository: CategoryAttributeRepository,
    @inject(PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN)
    private readonly productAttributeValueRepository: ProductAttributeValueRepository,
  ) {}

  async execute(input: CreateProductInputDto): Promise<Result<Product, CreateProductError>> {
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      return err({ reason: "user-not-found" });
    }

    const seller = await this.sellerRepository.findByUserId(input.userId);

    if (!seller) {
      return err({ reason: "user-not-seller" });
    }

    const category = await this.categoryRepository.findById(
      input.product.categoryId,
    );

    if (!category) {
      return err({ reason: "category-not-found" });
    }

    const categoryAttributes =
      await this.categoryAttributeRepository.findByCategoryId(
        input.product.categoryId,
      );

    const attributesValidationResult = validateProductAttributes(
      categoryAttributes,
      input.product.attributes,
    );

    if (attributesValidationResult.isErr()) {
      return err({
        reason: "invalid-product-attributes",
        error: attributesValidationResult.error,
      });
    }

    const attributeValues = attributesValidationResult.value;
    const p = input.product;

    const product = Product.create({
      id: NEW_ENTITY_ID,
      sellerId: seller.id,
      categoryId: p.categoryId,
      name: p.name,
      description: p.description,
      price: p.price,
      slug: p.slug,
      status: p.status ?? "draft",
    });

    const created = await this.productRepository.create(product);

    await this.productAttributeValueRepository.replaceForProduct(
      created.id,
      attributeValues,
    );

    return ok(created);
  }
}
