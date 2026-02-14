import type { Category } from './category.entity'

export interface CategoryRepository {
  findById: (id: number) => Promise<Category | null>
}

export const CATEGORY_REPOSITORY_TOKEN = Symbol.for('CategoryRepository')
