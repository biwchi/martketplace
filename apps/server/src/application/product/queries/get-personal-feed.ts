import { injectable, inject } from "inversify";
import { Result, err, ok } from "neverthrow";

import type { Product, ProductMetric } from "@domain/product";
import {
  type ProductRepository,
  type ProductMetricRepository,
  PRODUCT_METRIC_REPOSITORY_TOKEN,
  PRODUCT_REPOSITORY_TOKEN,
} from "@domain/product";
import {
  User,
  Visitor,
  type PreferencesProfile,
  type PreferencesProfileRepository,
  type UserRepository,
  PREFERENCES_PROFILE_REPOSITORY_TOKEN,
  USER_REPOSITORY_TOKEN,
} from "@domain/user";

import type { GetPersonalFeedInputDto, ProductFeedItemDto } from "../product.dto";
import { uniqueBy } from "@shared/utils/array";
import {
  type CachePort,
  CACHE_PORT_TOKEN,
} from "@application/ports";

export type GetPersonalFeedError =
  | { reason: "user-not-found" }
  | { reason: "limit-too-large" };

type ProductWithMetric = { product: Product, metric?: ProductMetric };

const FEED_BATCH_CONFIG = {
  totalSize: 500,
  popularSize: 100,
  priceMatchedSize: 150,
  userPreferencesSize: 250,
};

const PERSONALIZED_SCORE_WEIGHTS = {
  category: 0.5,
  price: 0.2,
  global: 0.4,
};

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 30;
const MAX_LIMIT = 100;

const CANDIDATES_CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
const BAN_CANDIDATES_TTL_MS = 2 * 24 * 60 * 60 * 1000; // 2 days

const getCandidatesCacheKey = (visitor: Visitor) => {
  const visitorIdentifier = visitor.userId
    ? `u-${visitor.userId}`
    : `v-${visitor.visitorId}`;

  return `feed:${visitorIdentifier}:candidates`;
};

@injectable()
export class GetPersonalFeed {
  constructor(
    @inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @inject(PREFERENCES_PROFILE_REPOSITORY_TOKEN)
    private readonly preferencesProfileRepository: PreferencesProfileRepository,
    @inject(PRODUCT_REPOSITORY_TOKEN)
    private readonly productRepository: ProductRepository,
    @inject(PRODUCT_METRIC_REPOSITORY_TOKEN)
    private readonly productMetricRepository: ProductMetricRepository,
    @inject(CACHE_PORT_TOKEN)
    private readonly cachePort: CachePort,
  ) { }

  async execute(input: GetPersonalFeedInputDto): Promise<Result<ProductFeedItemDto[], GetPersonalFeedError>> {
    if (input.limit && input.limit > MAX_LIMIT) {
      return err({ reason: "limit-too-large" });
    }

    const visitor = Visitor.create(input);
    const userAndPreferencesResult = await this.resolveUserAndPreferences(visitor);

    if (userAndPreferencesResult.isErr()) {
      return err(userAndPreferencesResult.error);
    }

    const { preferences } = userAndPreferencesResult.value;

    const candidates = await this.loadOrComputeCandidates(visitor, preferences);
    const paginated = await this.paginateAndRefill(visitor, candidates, preferences, input);

    return ok(paginated.map(({ product, metric }) => ({
      id: product.id,
      sellerId: product.sellerId,
      categoryId: product.categoryId,
      name: product.name,
      description: product.description,
      price: product.price,
      ratingAvg: metric?.averageRating ?? null,
      reviewsCount: metric?.reviewsCount ?? 0,
    })));
  }

  private async resolveUserAndPreferences(visitor: Visitor): Promise<Result<
    { user: User | null, preferences: PreferencesProfile | null },
    GetPersonalFeedError
  >> {
    const user = visitor.userId
      ? await this.userRepository.findById(visitor.userId)
      : null;

    if (visitor.userId && !user) {
      return err({ reason: "user-not-found" });
    }

    const preferences = user
      ? await this.preferencesProfileRepository.findByUserId(user.id)
      : await this.preferencesProfileRepository.findByVisitorId(visitor.visitorId);

    return ok({ user, preferences });
  }

  private async loadOrComputeCandidates(
    visitor: Visitor,
    preferences: PreferencesProfile | null,
  ): Promise<ProductWithMetric[]> {
    const cacheKey = getCandidatesCacheKey(visitor);
    const cachedCandidates = await this.cachePort.get<ProductWithMetric[]>(cacheKey);

    if (cachedCandidates) {
      return cachedCandidates;
    } else {
      const scoredCandidates = await this.getFreshScoredCandidates(visitor, preferences);

      // Cache the scored candidates to persist pagination
      await this.cachePort.set(
        cacheKey,
        scoredCandidates,
        CANDIDATES_CACHE_TTL_MS,
      );

      return scoredCandidates;
    }
  }

  private async paginateAndRefill(
    visitor: Visitor,
    candidates: ProductWithMetric[],
    preferences: PreferencesProfile | null,
    pagination: { page?: number, limit?: number },
  ): Promise<ProductWithMetric[]> {
    const cacheKey = getCandidatesCacheKey(visitor);
    const { page = DEFAULT_PAGE, limit = DEFAULT_LIMIT } = pagination;

    const startIdx = (page - 1) * limit;
    const endIdx = startIdx + limit;
    const paginated = candidates.slice(startIdx, endIdx);

    if (paginated.length < limit) {
      const toFillLength = limit - paginated.length;

      await this.cachePort.delete(cacheKey);
      const scoredCandidates = await this.getFreshScoredCandidates(visitor, preferences);

      paginated.push(...scoredCandidates.splice(0, toFillLength));

      await this.cachePort.set(
        cacheKey,
        scoredCandidates,
        CANDIDATES_CACHE_TTL_MS,
      );
    }

    return paginated;
  }

  private async getFreshScoredCandidates(
    visitor: Visitor,
    preferences: PreferencesProfile | null,
  ): Promise<ProductWithMetric[]> {
    const freshCandidates = await this.getCandidates(visitor, preferences);
    const ids = freshCandidates.map(candidate => candidate.product.id);

    // TODO: Implement a better strategy for hiding products from the feed for a visitor.
    await this.productRepository.banProductsForVisitor({
      userId: visitor.userId,
      visitorId: visitor.visitorId,
      productIds: ids,
      banUntil: new Date(Date.now() + BAN_CANDIDATES_TTL_MS),
    });


    return this.scoreCandidates(freshCandidates, preferences);
  }

  private async getCandidates(
    visitor: Visitor,
    preferences: PreferencesProfile | null,
  ): Promise<ProductWithMetric[]> {
    const userId = visitor.userId;
    const visitorId = visitor.visitorId;

    if (!preferences || !userId) {
      const popularProducts = await this.productRepository.findPopularProducts({
        userId,
        visitorId,
        limit: FEED_BATCH_CONFIG.totalSize,
      });

      return this.withMetrics(popularProducts);
    }

    const popularProducts = await this.productRepository.findPopularProducts({
      userId,
      visitorId,
      limit: FEED_BATCH_CONFIG.popularSize,
    });

    const priceMatchedProducts = await this.productRepository.findPopularPriceMatchedProducts({
      userId,
      visitorId,
      priceBucket: preferences.preferredAveragePrice, // TODO: Implement price bucket
      limit: FEED_BATCH_CONFIG.priceMatchedSize,
    });

    const userPreferencesProducts = await this.productRepository.findPopularProductsByCategories({
      userId,
      visitorId,
      limit: FEED_BATCH_CONFIG.userPreferencesSize,
      byCategoryIds: preferences.topCategoryIds,
    });

    const uniqueCandidates = uniqueBy((product) => product.id, [
      ...popularProducts,
      ...priceMatchedProducts,
      ...userPreferencesProducts,
    ]);


    return this.withMetrics(uniqueCandidates);
  }

  private async withMetrics(products: Product[]): Promise<ProductWithMetric[]> {
    const ids = products.map(product => product.id);
    const metrics = await this.productMetricRepository.findByProducts(ids);

    const metricsMap = new Map<number, ProductMetric>(
      metrics.map(metric => [metric.productId, metric]),
    );

    return products.map(product => ({
      product,
      metric: metricsMap.get(product.id),
    }));
  }

  private async scoreCandidates(
    candidates: ProductWithMetric[],
    preferences: PreferencesProfile | null,
  ): Promise<ProductWithMetric[]> {
    const scored = candidates.map(({ product, metric }) => {
      const popularityScore = metric?.popularityScore ?? 0;
      const freshnessScore = product.getFreshnessBoostScore();
      let personalizedScore = 0;

      if (preferences) {
        const categoryScore = preferences.getCategoryScore(product.categoryId);
        const priceScore = preferences.getPriceScore(product.price);

        personalizedScore = (
          categoryScore * PERSONALIZED_SCORE_WEIGHTS.category +
          priceScore * PERSONALIZED_SCORE_WEIGHTS.price
        ) * PERSONALIZED_SCORE_WEIGHTS.global;
      }

      return {
        product,
        metric,
        score: popularityScore + personalizedScore + freshnessScore
      };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored.map(({ product, metric }) => ({ product, metric }));
  }
}
