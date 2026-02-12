import { injectable, inject } from "inversify";
import { Result, err, ok } from "neverthrow";

import { NEW_ENTITY_ID } from "@domain/common";
import {
  UserProductEvent,
  type UserProductEventRepository,
  USER_PRODUCT_EVENT_REPOSITORY_TOKEN,
  type ProductMetricRepository,
  PRODUCT_METRIC_REPOSITORY_TOKEN,
  type ProductRepository,
  PRODUCT_REPOSITORY_TOKEN,
} from "@domain/product";
import {
  Visitor,
  type UserRepository,
  USER_REPOSITORY_TOKEN,
} from "@domain/user";

import type { CreateUserProductEventInputDto } from "../product.dto";

export type CreateUserProductEventError = "user-not-found" | "product-not-found";

@injectable()
export class CreateUserProductEvent {
  constructor(
    @inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @inject(USER_PRODUCT_EVENT_REPOSITORY_TOKEN)
    private readonly userProductEventRepository: UserProductEventRepository,
    @inject(PRODUCT_METRIC_REPOSITORY_TOKEN)
    private readonly productMetricRepository: ProductMetricRepository,
    @inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: ProductRepository,
  ) { }

  async execute(input: CreateUserProductEventInputDto): Promise<Result<void, CreateUserProductEventError>> {
    const product = await this.productRepository.findById(input.productId);
    if (!product) {
      return err("product-not-found");
    }

    const visitor = Visitor.create({
      visitorId: input.visitorId,
      userId: input.userId,
    });

    const user = visitor.userId
      ? await this.userRepository.findById(visitor.userId)
      : null;

    if (visitor.userId && !user) {
      return err("user-not-found");
    }

    const event = UserProductEvent.create({
      id: NEW_ENTITY_ID,
      userId: visitor.userId,
      visitorId: visitor.visitorId,
      productId: input.productId,
      categoryId: input.categoryId,
      eventType: input.eventType,
    });

    await this.userProductEventRepository.create(event);

    const column = event.getIncrementableMetricColumn();
    if (column) {
      await this.productMetricRepository.increment(input.productId, column);
    }

    return ok(undefined);
  }
}

