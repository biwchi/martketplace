import type { ProductMetricIncrementableColumn } from './product-metric.entity';

/** Event type for user/visitor product interactions. */
export type UserProductEventType = "view" | "cart_add" | "favorite";

/** Props required to create a user product event. Timestamps are set by the entity. */
export interface CreateUserProductEventProps {
  id: number;
  userId?: number;
  visitorId: string;
  productId: number;
  categoryId: number;
  eventType: UserProductEventType;
}

export interface UserProductEventProps extends CreateUserProductEventProps {
  createdAt: Date;
}

export class UserProductEvent {
  public readonly id: number;
  public readonly userId: number | undefined;
  public readonly visitorId: string;
  public readonly productId: number;
  public readonly categoryId: number;
  public readonly eventType: UserProductEventType;
  public readonly createdAt: Date;

  private constructor(props: UserProductEventProps) {
    this.id = props.id;
    this.userId = props.userId;
    this.visitorId = props.visitorId;
    this.productId = props.productId;
    this.categoryId = props.categoryId;
    this.eventType = props.eventType;
    this.createdAt = props.createdAt;
  }

  static create(props: CreateUserProductEventProps): UserProductEvent {
    if (props.visitorId.trim().length === 0) {
      throw new Error("UserProductEvent visitorId must not be empty");
    }

    const now = new Date();

    return new UserProductEvent({
      ...props,
      createdAt: now,
    });
  }

  public getIncrementableMetricColumn(): ProductMetricIncrementableColumn | null {
    switch (this.eventType) {
      case "view":
        return "viewsCount";
      case "cart_add":
        return "cartAddsCount";
      default:
        return null;
    }
  }
}
