import type { CategoryAttributeProps } from '@domain/category'
import type { ProductAttributeValueRow } from '@domain/product'
import type { ProductAttributeInputDto } from './product.dto'
import { CategoryAttribute } from '@domain/category'

/** Stable attribute IDs for tests. Use these instead of magic numbers. */
export const AttributeId = {
  RequiredString: 1,
  OptionalNumber: 2,
  RequiredSelect: 3,
  OptionalColor: 4,
} as const

/** Category ID used in category attribute fixtures. */
export const FixtureCategoryId = 10

/** Select option values for the RequiredSelect attribute. */
export const SelectOptions = ['small', 'medium', 'large'] as const

const now = new Date()

/** Base props for building category attributes. Override any field to extend. */
export function createCategoryAttributeProps(
  overrides: Partial<CategoryAttributeProps> & Pick<CategoryAttributeProps, 'id'>,
): CategoryAttributeProps {
  return {
    id: overrides.id,
    categoryId: overrides.categoryId ?? FixtureCategoryId,
    code: overrides.code ?? `attr-${overrides.id}`,
    name: overrides.name ?? `Attribute ${overrides.id}`,
    dataType: overrides.dataType ?? 'string',
    isRequired: overrides.isRequired ?? false,
    options: overrides.options,
    createdAt: overrides.createdAt ?? now,
    updatedAt: overrides.updatedAt ?? now,
  }
}

/** Build a single CategoryAttribute for tests. */
export function createCategoryAttribute(
  overrides: Partial<CategoryAttributeProps> & Pick<CategoryAttributeProps, 'id'>,
): CategoryAttribute {
  return CategoryAttribute.create(createCategoryAttributeProps(overrides))
}

/** Default set of category attributes: required string, optional number, required select. */
export function createDefaultCategoryAttributes(): CategoryAttribute[] {
  return [
    createCategoryAttribute({
      id: AttributeId.RequiredString,
      code: 'size_label',
      name: 'Size label',
      dataType: 'string',
      isRequired: true,
    }),
    createCategoryAttribute({
      id: AttributeId.OptionalNumber,
      code: 'weight_kg',
      name: 'Weight (kg)',
      dataType: 'number',
      isRequired: false,
    }),
    createCategoryAttribute({
      id: AttributeId.RequiredSelect,
      code: 'size',
      name: 'Size',
      dataType: 'select',
      isRequired: true,
      options: [...SelectOptions],
    }),
  ]
}

/** Build a product attribute input DTO. */
export function createProductAttributeInput(
  attributeId: number,
  value: string | number | boolean,
): ProductAttributeInputDto {
  return { attributeId, value }
}

/** Build the expected row shape returned by the validator on success. */
export function createExpectedRow(
  categoryAttributeId: number,
  value: string | number | boolean,
): ProductAttributeValueRow {
  return { categoryAttributeId, value }
}
