import type { CategoryRepository } from '@domain/category'
import { Category } from '@domain/category'

import { db } from '@infrastructure/db/postgres/client'
import { categories } from '@infrastructure/db/postgres/schema'
import { eq } from 'drizzle-orm'

export class PgCategoryRepository implements CategoryRepository {
  public async findById(id: number): Promise<Category | null> {
    const [row] = await db
      .select()
      .from(categories)
      .where(eq(categories.id, id))
      .limit(1)

    if (!row) {
      return null
    }

    return Category.create({
      id: row.id,
      name: row.name,
      slug: row.slug,
      iconName: row.iconName,
      parentId: row.parentId,
    })
  }
}
