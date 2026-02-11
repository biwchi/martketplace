import type { Seller } from "./seller.entity";

export interface SellerRepository {
  findByUserId(userId: number): Promise<Seller | null>;
}

export const SELLER_REPOSITORY_TOKEN = Symbol.for("SellerRepository");
