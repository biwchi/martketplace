import type { CategoryAttribute } from './category-attribute.entity'

export interface CategoryAttributeRepository {
  findByCategoryId: (categoryId: number) => Promise<CategoryAttribute[]>
}

export const CATEGORY_ATTRIBUTE_REPOSITORY_TOKEN = Symbol.for(
  'CategoryAttributeRepository',
)
