import type { AttributeValueValidationErrorReason, CategoryAttribute } from '@domain/category'

import type { ProductAttributeValueRow } from '@domain/product'

import type { Result } from 'neverthrow'
import type { ProductAttributeInputDto } from './product.dto'
import { err, ok } from 'neverthrow'

interface InvalidAttributeValue {
  attributeId: number
  reason: AttributeValueValidationErrorReason
}

export interface InvalidProductAttributesError {
  requiredIds: number[]
  invalidValues: InvalidAttributeValue[]
}

/**
 * Validates product attribute input against category attributes.
 * Ensures all required attributes are present and every value passes CategoryAttribute.isValidValue.
 * Returns the validated rows ready for ProductAttributeValueRepository.replaceForProduct.
 */
export function validateProductAttributes(
  categoryAttributes: CategoryAttribute[],
  inputAttributes: ProductAttributeInputDto[],
): Result<ProductAttributeValueRow[], InvalidProductAttributesError> {
  const attrById = new Map(categoryAttributes.map(a => [a.id, a]))
  const requiredIds = new Set(
    categoryAttributes.filter(a => a.isRequired).map(a => a.id),
  )

  const inputByAttrId = new Map<number, ProductAttributeInputDto>()
  const missingRequiredAttributeIds: number[] = []

  for (const a of inputAttributes) {
    inputByAttrId.set(a.attributeId, a)
  }

  for (const id of requiredIds) {
    if (!inputByAttrId.has(id)) {
      missingRequiredAttributeIds.push(id)
    }
  }

  const invalidValues: InvalidAttributeValue[] = []
  const attributeValues: ProductAttributeValueRow[] = []

  for (const input of inputAttributes) {
    const attr = attrById.get(input.attributeId)

    if (!attr) {
      continue
    }

    const validation = attr.isValidValue(input.value)

    if (validation.isErr()) {
      invalidValues.push({
        attributeId: input.attributeId,
        reason: validation.error,
      })
    }
    else {
      attributeValues.push({
        categoryAttributeId: input.attributeId,
        value: input.value,
      })
    }
  }

  if (missingRequiredAttributeIds.length > 0 || invalidValues.length > 0) {
    return err({
      requiredIds: Array.from(requiredIds),
      invalidValues,
    })
  }

  return ok(attributeValues)
}
