import type { CreateProductError } from './create-product'

import { describe, expect, it, vi } from 'vitest'
import { AttributeId, createProductAttributeInput, SelectOptions } from '../product-attributes.validator.fixtures'
import { CreateProduct } from './create-product'
import {
  createCreateProductInput,
  createMockRepositories,
  FixtureIds,
} from './create-product.fixtures'

function createCommand() {
  const mocks = createMockRepositories()
  const command = new CreateProduct(
    mocks.userRepository,
    mocks.sellerRepository,
    mocks.productRepository,
    mocks.categoryRepository,
    mocks.categoryAttributeRepository,
    mocks.productAttributeValueRepository,
  )
  return { command, ...mocks }
}

describe('createProduct', () => {
  describe('when user and seller exist and product attributes are valid', () => {
    it('creates product and persists attribute values', async () => {
      const { command, productRepository, productAttributeValueRepository }
        = createCommand()

      const attrs = [
        createProductAttributeInput(AttributeId.RequiredString, 'Cotton'),
        createProductAttributeInput(AttributeId.RequiredSelect, SelectOptions[0]),
      ]

      const input = createCreateProductInput({
        product: {
          name: 'Test Shirt',
          slug: 'test-shirt',
          attributes: attrs,
        },
      })

      const result = await command.execute(input)

      expect(result.isOk()).toBe(true)
      if (result.isOk()) {
        expect(result.value.id).toBe(FixtureIds.CreatedProductId)
        expect(result.value.name).toBe('Test Shirt')
        expect(result.value.slug).toBe('test-shirt')
        expect(result.value.sellerId).toBe(FixtureIds.SellerId)
        expect(result.value.categoryId).toBe(FixtureIds.CategoryId)
      }
      expect(productRepository.create).toHaveBeenCalledTimes(1)
      expect(productAttributeValueRepository.replaceForProduct).toHaveBeenCalledWith(
        FixtureIds.CreatedProductId,

        expect.arrayContaining(attrs.map(attr => ({
          categoryAttributeId: attr.attributeId,
          value: attr.value,
        }))),
      )
    })

    it('uses draft status when status is omitted', async () => {
      const { command, productRepository } = createCommand()
      const input = createCreateProductInput()

      const result = await command.execute(input)

      expect(result.isOk()).toBe(true)
      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'draft' }),
      )
    })

    it('uses provided status when given', async () => {
      const { command, productRepository } = createCommand()
      const input = createCreateProductInput({
        product: { status: 'active' },
      })

      const result = await command.execute(input)

      expect(result.isOk()).toBe(true)
      expect(productRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ status: 'active' }),
      )
    })
  })

  describe('when user is not found', () => {
    it('returns err with reason user-not-found', async () => {
      const { command, userRepository } = createCommand()
      vi.mocked(userRepository.findById).mockResolvedValue(null)
      const input = createCreateProductInput({ userId: FixtureIds.UserId })

      const result = await command.execute(input)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error = result.error as CreateProductError
        expect(error.reason).toBe('user-not-found')
      }
      expect(userRepository.findById).toHaveBeenCalledWith(FixtureIds.UserId)
    })
  })

  describe('when category is not found', () => {
    it('returns err with reason category-not-found', async () => {
      const { command, categoryRepository, productRepository } = createCommand()
      vi.mocked(categoryRepository.findById).mockResolvedValue(null)
      const input = createCreateProductInput({
        product: { categoryId: FixtureIds.CategoryId },
      })

      const result = await command.execute(input)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error = result.error
        expect(error.reason).toBe('category-not-found')
      }
      expect(categoryRepository.findById).toHaveBeenCalledWith(
        FixtureIds.CategoryId,
      )
      expect(productRepository.create).not.toHaveBeenCalled()
    })
  })

  describe('when user is not a seller', () => {
    it('returns err with reason user-not-seller', async () => {
      const { command, sellerRepository } = createCommand()
      vi.mocked(sellerRepository.findByUserId).mockResolvedValue(null)
      const input = createCreateProductInput({ userId: FixtureIds.UserId })

      const result = await command.execute(input)

      expect(result.isErr()).toBe(true)
      if (result.isErr()) {
        const error = result.error as CreateProductError
        expect(error.reason).toBe('user-not-seller')
      }
      expect(sellerRepository.findByUserId).toHaveBeenCalledWith(FixtureIds.UserId)
    })
  })

  describe('when product attributes are invalid', () => {
    it('returns err with reason invalid-product-attributes and validation details', async () => {
      const { command, productRepository }
        = createCommand()
      const input = createCreateProductInput({
        product: {
          attributes: [
            createProductAttributeInput(AttributeId.RequiredString, 'OK'),
            createProductAttributeInput(AttributeId.RequiredSelect, 'invalid-option'),
          ],
        },
      })

      const result = await command.execute(input)

      expect(result.isErr()).toBe(true)

      if (result.isErr()) {
        const error = result.error

        expect(error.reason).toBe('invalid-product-attributes')

        if ('error' in error) {
          expect(error.error.invalidValues).toHaveLength(1)
          expect(error.error.invalidValues[0]?.reason).toBe(
            'option-value-not-allowed',
          )
        }
      }

      expect(productRepository.create).not.toHaveBeenCalled()
    })

    it('does not call productRepository or replaceForProduct when required attribute is missing', async () => {
      const { command, productRepository, productAttributeValueRepository }
        = createCommand()
      const input = createCreateProductInput({
        product: {
          attributes: [
            createProductAttributeInput(AttributeId.RequiredString, 'Only one'),
            // RequiredSelect missing
          ],
        },
      })

      const result = await command.execute(input)

      expect(result.isErr()).toBe(true)
      expect(productRepository.create).not.toHaveBeenCalled()
      expect(productAttributeValueRepository.replaceForProduct).not.toHaveBeenCalled()
    })
  })
})
