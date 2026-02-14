import type { InvalidProductAttributesError } from './product-attributes.validator'

import { describe, expect, it } from 'vitest'
import {

  validateProductAttributes,
} from './product-attributes.validator'
import {
  AttributeId,
  createCategoryAttribute,
  createDefaultCategoryAttributes,
  createExpectedRow,
  createProductAttributeInput,
  SelectOptions,
} from './product-attributes.validator.fixtures'

describe('validateProductAttributes', () => {
  describe('when all required attributes are present and values are valid', () => {
    it('returns ok with validated rows in the expected shape', () => {
      const categoryAttributes = createDefaultCategoryAttributes()
      const inputAttributes = [
        createProductAttributeInput(AttributeId.RequiredString, 'Cotton'),
        createProductAttributeInput(AttributeId.OptionalNumber, 0.5),
        createProductAttributeInput(AttributeId.RequiredSelect, SelectOptions[1]),
      ]

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual([
          createExpectedRow(AttributeId.RequiredString, 'Cotton'),
          createExpectedRow(AttributeId.OptionalNumber, 0.5),
          createExpectedRow(AttributeId.RequiredSelect, SelectOptions[1]),
        ])
      }
    })

    it('returns ok when optional attributes are omitted', () => {
      const categoryAttributes = createDefaultCategoryAttributes()
      const inputAttributes = [
        createProductAttributeInput(AttributeId.RequiredString, 'Polyester'),
        createProductAttributeInput(AttributeId.RequiredSelect, SelectOptions[0]),
      ]

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toHaveLength(2)
        expect(result.value).toEqual(
          expect.arrayContaining([
            createExpectedRow(AttributeId.RequiredString, 'Polyester'),
            createExpectedRow(AttributeId.RequiredSelect, SelectOptions[0]),
          ]),
        )
      }
    })

    it('returns ok with empty array when category has no attributes', () => {
      const categoryAttributes: ReturnType<typeof createDefaultCategoryAttributes> = []
      const inputAttributes: ReturnType<typeof createProductAttributeInput>[] = []

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual([])
      }
    })
  })

  describe('when a required attribute is missing', () => {
    it('returns err with requiredIds containing all required attribute ids', () => {
      const categoryAttributes = createDefaultCategoryAttributes()
      const inputAttributes = [
        createProductAttributeInput(AttributeId.RequiredString, 'Wool'),
        // RequiredSelect is missing
      ]

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error = result.error as InvalidProductAttributesError
        expect(error.requiredIds).toContain(AttributeId.RequiredString)
        expect(error.requiredIds).toContain(AttributeId.RequiredSelect)
        expect(error.invalidValues).toHaveLength(0)
      }
    })

    it('returns err when no attributes are sent but category has required', () => {
      const categoryAttributes = createDefaultCategoryAttributes()
      const inputAttributes: ReturnType<typeof createProductAttributeInput>[] = []

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error = result.error as InvalidProductAttributesError
        expect(error.requiredIds).toContain(AttributeId.RequiredString)
        expect(error.requiredIds).toContain(AttributeId.RequiredSelect)
      }
    })
  })

  describe('when an attribute value fails validation', () => {
    it('returns err with invalidValues when string attribute gets wrong type', () => {
      const categoryAttributes = createDefaultCategoryAttributes()
      const inputAttributes = [
        createProductAttributeInput(AttributeId.RequiredString, 123 as unknown as string),
        createProductAttributeInput(AttributeId.RequiredSelect, SelectOptions[0]),
      ]

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error = result.error as InvalidProductAttributesError
        expect(error.invalidValues).toHaveLength(1)
        expect(error.invalidValues[0]).toEqual({
          attributeId: AttributeId.RequiredString,
          reason: 'invalid-data-type',
        })
      }
    })

    it('returns err with invalidValues when select value is not in options', () => {
      const categoryAttributes = createDefaultCategoryAttributes()
      const inputAttributes = [
        createProductAttributeInput(AttributeId.RequiredString, 'Label'),
        createProductAttributeInput(AttributeId.RequiredSelect, 'xl'),
      ]

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error = result.error as InvalidProductAttributesError
        expect(error.invalidValues).toHaveLength(1)
        expect(error.invalidValues[0]).toEqual({
          attributeId: AttributeId.RequiredSelect,
          reason: 'option-value-not-allowed',
        })
      }
    })

    it('returns err with invalidValues when required value is missing (empty string)', () => {
      const categoryAttributes = createDefaultCategoryAttributes()
      const inputAttributes = [
        createProductAttributeInput(AttributeId.RequiredString, ''),
        createProductAttributeInput(AttributeId.RequiredSelect, SelectOptions[0]),
      ]

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error = result.error as InvalidProductAttributesError
        expect(error.invalidValues).toContainEqual({
          attributeId: AttributeId.RequiredString,
          reason: 'required-value-missing',
        })
      }
    })
  })

  describe('when input contains attribute not in category', () => {
    it('skips unknown attribute and still validates known ones', () => {
      const categoryAttributes = createDefaultCategoryAttributes()
      const unknownAttributeId = 999
      const inputAttributes = [
        createProductAttributeInput(AttributeId.RequiredString, 'Known'),
        createProductAttributeInput(AttributeId.RequiredSelect, SelectOptions[0]),
        createProductAttributeInput(unknownAttributeId, 'ignored'),
      ]

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toHaveLength(2)
        expect(result.value).not.toContainEqual(
          expect.objectContaining({ categoryAttributeId: unknownAttributeId }),
        )
      }
    })
  })

  describe('when both missing required and invalid values exist', () => {
    it('returns err with both requiredIds and invalidValues', () => {
      const categoryAttributes = createDefaultCategoryAttributes()
      const inputAttributes = [
        createProductAttributeInput(AttributeId.RequiredString, 42 as unknown as string),
        // RequiredSelect missing
      ]

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error = result.error as InvalidProductAttributesError
        expect(error.requiredIds.length).toBeGreaterThan(0)
        expect(error.invalidValues).toHaveLength(1)
        expect(error.invalidValues[0]?.attributeId).toBe(AttributeId.RequiredString)
        expect(error.invalidValues[0]?.reason).toBe('invalid-data-type')
      }
    })
  })

  describe('category with only optional attributes', () => {
    it('returns ok with empty input', () => {
      const categoryAttributes = [
        createCategoryAttribute({
          id: AttributeId.OptionalNumber,
          code: 'weight',
          name: 'Weight',
          dataType: 'number',
          isRequired: false,
        }),
      ]
      const inputAttributes: ReturnType<typeof createProductAttributeInput>[] = []

      const result = validateProductAttributes(categoryAttributes, inputAttributes)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value).toEqual([])
      }
    })
  })
})
