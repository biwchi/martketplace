/** Props that can be updated on an existing category. */
export interface UpdateCategoryProps {
  name?: string
  slug?: string
  iconName?: string
  parentId?: number | null
}

/** Props required to create a category. Timestamps are set by the entity. */
export interface CreateCategoryProps {
  id: number
  name: string
  slug: string
  iconName: string
  parentId: number | null
}

export interface CategoryProps extends CreateCategoryProps {
  createdAt: Date
  updatedAt: Date
}

interface ValidateCategoryDataProps extends Pick<CreateCategoryProps, 'name' | 'slug'> {}

function validateCategoryData(data: ValidateCategoryDataProps): void {
  if (data.name.trim().length === 0) {
    throw new Error('Category name must not be empty')
  }
  if (data.slug.trim().length === 0) {
    throw new Error('Category slug must not be empty')
  }
}

export class Category {
  public readonly id: number
  public readonly name: string
  public readonly slug: string
  public readonly iconName: string
  /** Parent category id; null for root categories. Enables infinite nesting. */
  public readonly parentId: number | null
  public readonly createdAt: Date
  public readonly updatedAt: Date

  private constructor(props: CategoryProps) {
    this.id = props.id
    this.name = props.name
    this.slug = props.slug
    this.iconName = props.iconName
    this.parentId = props.parentId
    this.createdAt = props.createdAt
    this.updatedAt = props.updatedAt
  }

  static create(props: CreateCategoryProps): Category {
    validateCategoryData(props)

    const now = new Date()

    return new Category({
      ...props,
      createdAt: now,
      updatedAt: now,
    })
  }

  update(props: UpdateCategoryProps): Category {
    const name = props.name ?? this.name
    const slug = props.slug ?? this.slug
    const iconName = props.iconName ?? this.iconName
    const parentId = props.parentId !== undefined ? props.parentId : this.parentId

    validateCategoryData({ name, slug })

    return new Category({
      id: this.id,
      name,
      slug,
      iconName,
      parentId,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    })
  }

  get isRoot(): boolean {
    return this.parentId === null
  }
}
