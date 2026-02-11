import type { ProductAttributeValue, ProductStatus } from "@domain/product";

export interface ProductAttributeInputDto {
  attributeId: number;
  value: ProductAttributeValue
}

export interface CreateProductProductDto {
  categoryId: number;
  name: string;
  description: string;
  price: number;
  slug: string;
  status?: ProductStatus;
  /** Attribute values for this product; must satisfy category's required attributes and types. */
  attributes: ProductAttributeInputDto[];
}

export interface CreateProductInputDto {
  userId: number;
  product: CreateProductProductDto;
}

export interface UpdateProductProductDto {
  name?: string;
  description?: string;
  price?: number;
  slug?: string;
  status?: ProductStatus;
  /** If provided, replaces all product attribute values (validated against category). */
  attributes?: ProductAttributeInputDto[];
}

export interface UpdateProductInputDto {
  userId: number;
  productId: number;
  product: UpdateProductProductDto;
}

export interface DeleteProductInputDto {
  userId: number;
  productId: number;
}

export interface GetPersonalFeedInputDto {
  visitorId: string;
  /** User id if authenticated. */
  userId?: number;
  /** Number of products to return. Defaults to 30. Maximum is 100. */
  limit?: number;
  /** Page number into the personalized feed. Defaults to 1. */
  page?: number;
}
