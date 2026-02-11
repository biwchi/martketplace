import type { ProductAttributeValue } from "./product.entity";

export interface ProductAttributeValueRow {
  categoryAttributeId: number;
  value: ProductAttributeValue;
}

export interface ProductAttributeValueRepository {
  /** Replaces all attribute values for a product (deletes existing, inserts new). */
  replaceForProduct(
    productId: number,
    values: ProductAttributeValueRow[],
  ): Promise<void>;
}

export const PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN = Symbol.for(
  "ProductAttributeValueRepository",
);
