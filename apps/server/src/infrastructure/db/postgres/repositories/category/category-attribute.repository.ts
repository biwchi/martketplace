import { eq } from "drizzle-orm";

import {
  CategoryAttribute,
  type CategoryAttributeRepository,
} from "@domain/category";
import { db } from "@infrastructure/db/postgres/client";
import { categoryAttributes } from "@infrastructure/db/postgres/schema";

export class PgCategoryAttributeRepository
  implements CategoryAttributeRepository {
  public async findByCategoryId(
    categoryId: number,
  ): Promise<CategoryAttribute[]> {
    const rows = await db
      .select()
      .from(categoryAttributes)
      .where(eq(categoryAttributes.categoryId, categoryId));

    return rows.map((row) =>
      CategoryAttribute.create({
        id: row.id,
        categoryId: row.categoryId,
        code: row.code,
        name: row.name,
        dataType: row.dataType,
        isRequired: row.isRequired,
        options: row.options ?? undefined,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
      }),
    );
  }
}


