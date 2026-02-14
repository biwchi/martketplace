import type { ProductRepository } from '@domain/product'
import type { SellerRepository } from '@domain/seller'
import type { UserRepository } from '@domain/user'
import type { Result } from 'neverthrow'

import type { DeleteProductInputDto } from '../product.dto'
import {
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

export type DeleteProductError
  = | 'user-not-found'
    | 'user-not-seller'
    | 'product-not-found'
    | 'forbidden'

@injectable()
export class DeleteProduct {
  constructor(
    @inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @inject(SELLER_REPOSITORY_TOKEN)
    private readonly sellerRepository: SellerRepository,
    @inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: ProductRepository,
  ) { }

  async execute(
    input: DeleteProductInputDto,
  ): Promise<Result<void, DeleteProductError>> {
    const user = await this.userRepository.findById(input.userId)

    if (!user) {
      return err('user-not-found')
    }

    const seller = await this.sellerRepository.findByUserId(input.userId)

    if (!seller) {
      return err('user-not-seller')
    }

    const product = await this.productRepository.findById(input.productId)

    if (!product) {
      return err('product-not-found')
    }

    if (product.sellerId !== seller.id) {
      return err('forbidden')
    }

    await this.productRepository.delete(product.id)
    return ok(undefined)
  }
}
