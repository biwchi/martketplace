import { t } from 'elysia'

const productStatusSchema = t.Union([
  t.Literal('draft'),
  t.Literal('active'),
])

const productAttributeValueSchema = t.Union([
  t.String(),
  t.Numeric(),
  t.Boolean(),
])

export const productAttributeSchema = t.Object({
  attributeId: t.Number(),
  value: productAttributeValueSchema,
})

export const createProductBodySchema = t.Object({
  categoryId: t.Number(),
  name: t.String(),
  description: t.String(),
  price: t.Numeric(),
  slug: t.String(),
  status: t.Optional(productStatusSchema),
  attributes: t.Array(productAttributeSchema),
})

export const updateProductBodySchema = t.Object({
  name: t.Optional(t.String()),
  description: t.Optional(t.String()),
  price: t.Optional(t.Numeric()),
  slug: t.Optional(t.String()),
  status: t.Optional(productStatusSchema),
  attributes: t.Optional(t.Array(productAttributeSchema)),
})

export const productIdParamsSchema = t.Object({
  id: t.Number(),
})

export const getPersonalFeedQuerySchema = t.Object({
  limit: t.Optional(t.Number()),
  page: t.Optional(t.Number()),
})

export const createUserProductEventBodySchema = t.Object({
  productId: t.Number(),
  categoryId: t.Number(),
  eventType: t.Union([
    t.Literal('view'),
    t.Literal('cart_add'),
    t.Literal('favorite'),
  ]),
})

export const productFeedItemSchema = t.Object({
  id: t.Number(),
  sellerId: t.Number(),
  categoryId: t.Number(),
  name: t.String(),
  description: t.String(),
  price: t.Numeric({ minimum: 0 }),
  ratingAvg: t.Nullable(t.Numeric({ minimum: 0, maximum: 5 })),
  reviewsCount: t.Number(),
})

export const productFeedListSchema = t.Array(productFeedItemSchema)
