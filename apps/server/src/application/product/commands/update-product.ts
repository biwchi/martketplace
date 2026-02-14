import type {
  CategoryAttributeRepository,
  CategoryRepository,
} from '@domain/category'
import type {
  ProductAttributeValueRepository,
  ProductRepository,
} from '@domain/product'
import type { SellerRepository } from '@domain/seller'

import type { UserRepository } from '@domain/user'
import type { Result } from 'neverthrow'
import type { InvalidProductAttributesError } from '../product-attributes.validator'
import type { UpdateProductInputDto } from '../product.dto'
import {
  CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN,
  CATEGORY_REPOSITORY_TOKEN,
} from '@domain/category'
import {
  PRODUCT_ATTRIBUTE_VALUE_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
} from '@domain/product'
import {
  SELLER_REPOSITORY_TOKEN,

} from '@domain/seller'
import {
  USER_REPOSITORY_TOKEN,

} from '@domain/user'

import { inject, injectable } from 'inversify'
import { err, ok } from 'neverthrow'
import {

  validateProductAttributes,
} from '../product-attributes.validator'

export type UpdateProductError
  = | { reason: 'user-not-found' }
    | { reason: 'user-not-seller' }
    | { reason: 'product-not-found' }
    | { reason: 'forbidden' }
    | { reason: 'category-not-found' }
    | { reason: 'invalid-product-attributes', error: InvalidProductAttributesError }

@injectable()
export class UpdateProduct {
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
  ) { }

  async execute(
    input: UpdateProductInputDto,
  ): Promise<Result<void, UpdateProductError>> {
    const user = await this.userRepository.findById(input.userId)
    if (!user) {
      return err({ reason: 'user-not-found' })
    }

    const seller = await this.sellerRepository.findByUserId(input.userId)
    if (!seller) {
      return err({ reason: 'user-not-seller' })
    }

    const product = await this.productRepository.findById(input.productId)
    if (!product) {
      return err({ reason: 'product-not-found' })
    }

    if (product.sellerId !== seller.id) {
      return err({ reason: 'forbidden' })
    }

    const category = await this.categoryRepository.findById(product.categoryId)

    if (!category) {
      return err({ reason: 'category-not-found' })
    }

    const updateProps = input.product

    if (updateProps.attributes !== undefined) {
      const categoryAttributes
        = await this.categoryAttributeRepository.findByCategoryId(
          product.categoryId,
        )

      const validation = validateProductAttributes(
        categoryAttributes,
        updateProps.attributes,
      )

      if (validation.isErr()) {
        return err({
          reason: 'invalid-product-attributes',
          error: validation.error,
        })
      }

      await this.productAttributeValueRepository.replaceForProduct(
        product.id,
        validation.value,
      )
    }

    const hasProductUpdates
      = updateProps.name !== undefined
        || updateProps.description !== undefined
        || updateProps.price !== undefined
        || updateProps.slug !== undefined
        || updateProps.status !== undefined

    if (!hasProductUpdates) {
      return ok()
    }

    const { attributes: _, ...productUpdateProps } = updateProps

    await this.productRepository.update(
      product.update(productUpdateProps),
    )

    return ok()
  }
}
