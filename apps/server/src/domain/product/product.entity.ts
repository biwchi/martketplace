export type ProductAttributeValue = string | number | boolean;
export type ProductStatus = "draft" | "active";

export interface CreateProductProps {
  id: number;
  sellerId: number;
  categoryId: number;
  name: string;
  description: string;
  price: number;
  slug: string;
  status: ProductStatus;
}

export interface UpdateProductProps extends Partial<Pick<
  ProductProps, "name" | "description" | "price" | "slug" | "status"
>> { }

export interface ProductProps extends CreateProductProps {
  createdAt: Date;
  updatedAt: Date;
}

interface ValidateProductDataProps extends Pick<CreateProductProps, "name" | "price" | "slug"> { }

const validateProductData = (data: ValidateProductDataProps): void => {
  if (data.name.trim().length === 0) {
    throw new Error("Product name must not be empty");
  }
  if (data.price < 0) {
    throw new Error("Product price must be non-negative");
  }
  if (data.slug.trim().length === 0) {
    throw new Error("Product slug must not be empty");
  }
};

export class Product {
  public readonly id: number;
  public readonly sellerId: number;
  public readonly categoryId: number;
  public readonly name: string;
  public readonly description: string;
  public readonly price: number;
  public readonly slug: string;
  public readonly status: ProductStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: ProductProps) {
    this.id = props.id;
    this.sellerId = props.sellerId;
    this.categoryId = props.categoryId;
    this.name = props.name;
    this.description = props.description;
    this.price = props.price;
    this.slug = props.slug;
    this.status = props.status;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: CreateProductProps): Product {
    validateProductData(props);

    const now = new Date();

    return new Product({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }

  public update(props: UpdateProductProps): Product {
    const name = props.name ?? this.name;
    const description = props.description ?? this.description;
    const price = props.price ?? this.price;
    const slug = props.slug ?? this.slug;
    const status = props.status ?? this.status;

    validateProductData({ name, price, slug });

    return new Product({
      id: this.id,
      sellerId: this.sellerId,
      categoryId: this.categoryId,
      name,
      description,
      price,
      slug,
      status,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }

  get isActive(): boolean {
    return this.status === "active";
  }

  public getFreshnessBoostScore(): number {
    const daysSinceCreated = Math.floor((new Date().getTime() - this.createdAt.getTime()) / (1000 * 60 * 60 * 24));

    return Math.exp(-daysSinceCreated / 30);
  }
}
