export interface CreatePreferencesProfileProps {
  visitorId?: string
  userId?: number
  /**
   * Category IDs the user is most interested in, ordered from most to least
   * relevant. This is intentionally an array of IDs (not entities) so it can
   * be recomputed from analytics without pulling full category objects.
   */
  topCategoryIds: number[]
  /**
   * Price point the user is typically interested in.
   * Recommendation: store this in the smallest currency unit (e.g. cents).
   */
  preferredAveragePrice: number
}

export interface PreferencesProfileProps extends CreatePreferencesProfileProps {
  /** Last time these preferences were updated or recalculated. */
  updatedAt?: Date
}

function validatePreferencesProfileData(props: CreatePreferencesProfileProps): void {
  const hasUserId = typeof props.userId === 'number'
  const hasVisitorId = typeof props.visitorId === 'string' && props.visitorId.length > 0

  if (hasUserId === hasVisitorId) {
    throw new Error('PreferencesProfile must have exactly one of userId or visitorId')
  }

  if (hasUserId && (props.userId as number) <= 0) {
    throw new Error('PreferencesProfile userId must be positive')
  }

  if (props.preferredAveragePrice < 0) {
    throw new Error('PreferencesProfile preferredAveragePrice must be non-negative')
  }

  if (props.topCategoryIds.some(id => id <= 0)) {
    throw new Error('PreferencesProfile topCategoryIds must contain only positive IDs')
  }
}

/**
 * PreferencesProfile captures learned preferences for a single subject
 * (user, visitor, etc.).
 *
 * It is intentionally immutable – any update returns a new instance,
 * which makes it easier to reason about in the application layer.
 */
export class PreferencesProfile {
  public readonly userId?: number
  public readonly visitorId?: string
  public readonly topCategoryIds: number[]
  public readonly preferredAveragePrice: number
  public readonly updatedAt: Date

  private constructor(props: PreferencesProfileProps) {
    this.userId = props.userId
    this.visitorId = props.visitorId
    this.topCategoryIds = [...props.topCategoryIds]
    this.preferredAveragePrice = props.preferredAveragePrice
    this.updatedAt = props.updatedAt ?? new Date()
  }

  static create(props: CreatePreferencesProfileProps): PreferencesProfile {
    validatePreferencesProfileData(props)

    const now = new Date()

    return new PreferencesProfile({
      ...props,
      topCategoryIds: [...props.topCategoryIds],
      updatedAt: now,
    })
  }

  /**
   * Returns a new PreferencesProfile instance with updated fields and a fresh
   * updatedAt timestamp. Useful when recalculating preferences from events.
   */
  public withUpdated(props: Partial<CreatePreferencesProfileProps>): PreferencesProfile {
    const next: CreatePreferencesProfileProps = {
      userId: props.userId ?? this.userId,
      topCategoryIds: props.topCategoryIds ?? this.topCategoryIds,
      preferredAveragePrice: props.preferredAveragePrice ?? this.preferredAveragePrice,
    }

    validatePreferencesProfileData(next)

    return new PreferencesProfile({
      ...next,
      topCategoryIds: [...next.topCategoryIds],
      updatedAt: new Date(),
    })
  }

  public getCategoryScore(categoryId: number): number {
    const reversed = [...this.topCategoryIds].reverse()
    return (reversed.findIndex(id => id === categoryId) + 1) * 0.5
  }

  public getPriceScore(price: number): number {
    return Math.exp(
      -Math.abs(price - this.preferredAveragePrice) / this.preferredAveragePrice,
    )
  }
}
