import { eq } from "drizzle-orm";

import { Seller, type SellerRepository } from "@domain/seller";
import { db } from "@infrastructure/db/postgres/client";
import { sellers } from "@infrastructure/db/postgres/schema";

export class PgSellerRepository implements SellerRepository {
  public async findByUserId(userId: number): Promise<Seller | null> {
    const [row] = await db
      .select()
      .from(sellers)
      .where(eq(sellers.userId, userId))
      .limit(1);

    if (!row) {
      return null;
    }

    return Seller.create({
      id: row.id,
      userId: row.userId,
      name: row.name,
      status: row.status,
      createdAt: row.createdAt,
      updatedAt: row.updatedAt,
    });
  }
}


