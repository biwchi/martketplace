import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Result, err, ok } from "neverthrow";

import {
  type UserRepository,
  USER_REPOSITORY_TOKEN,
} from "@domain/user";
import {
  type SellerRepository,
  SELLER_REPOSITORY_TOKEN,
} from "@domain/seller";
import {
  type ProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from "@domain/product";
import type { DeleteProductInputDto } from "../product.dto";

export type DeleteProductError =
  | "user-not-found"
  | "user-not-seller"
  | "product-not-found"
  | "forbidden";

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
    const user = await this.userRepository.findById(input.userId);

    if (!user) {
      return err("user-not-found");
    }

    const seller = await this.sellerRepository.findByUserId(input.userId);

    if (!seller) {
      return err("user-not-seller");
    }

    const product = await this.productRepository.findById(input.productId);

    if (!product) {
      return err("product-not-found");
    }

    if (product.sellerId !== seller.id) {
      return err("forbidden");
    }

    await this.productRepository.delete(product.id);
    return ok(undefined);
  }
}
