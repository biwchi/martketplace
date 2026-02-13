import type {
  CreateProduct,
  UpdateProduct,
  DeleteProduct,
  GetPersonalFeed,
  RecalculateDirtyProductsPopularity,
  CreateUserProductEvent,
} from '@application/product';
import type { Product } from '@domain/product';
import Elysia, { status, t } from 'elysia';

import { authMiddleware, deriveUserId, visitorMiddleware } from '@infrastructure/http/middlewares';
import { errorResponseSchema } from '@infrastructure/http/shared';

import {
  createProductBodySchema,
  updateProductBodySchema,
  productIdParamsSchema,
  getPersonalFeedQuerySchema,
  createUserProductEventBodySchema,
  productFeedListSchema,
} from './product.controller-schema';
import {
  productDescription,
  productSummary,
  productTags,
} from './product.docs';
import cron from '@elysiajs/cron';

interface Dependencies {
  createProduct: CreateProduct,
  updateProduct: UpdateProduct,
  deleteProduct: DeleteProduct,
  getPersonalFeed: GetPersonalFeed,
  recalculateDirtyProductsPopularity: RecalculateDirtyProductsPopularity,
  createUserProductEvent: CreateUserProductEvent,
}

export function createProductController(dependencies: Dependencies) {
  const {
    createProduct,
    updateProduct,
    deleteProduct,
    getPersonalFeed,
    recalculateDirtyProductsPopularity,
    createUserProductEvent,
  } = dependencies;

  return new Elysia({ prefix: '/products' })
    .use(visitorMiddleware)
    .group('', (app) => app
      .use(authMiddleware)
      .post('/', async ({ body, userId }) => {
        const result = await createProduct.execute({
          userId,
          product: body,
        });

        if (result.isErr()) {
          const error = result.error;

          switch (error.reason) {
            case 'user-not-found':
              return status(404, { summary: 'User not found' });
            case 'user-not-seller':
              return status(403, { summary: 'User is not a seller' });
            case 'category-not-found':
              return status(404, { summary: 'Category not found' });
            case 'invalid-product-attributes':
              return status(400, {
                summary: 'Invalid product attributes',
                detail: JSON.stringify(error.error),
              });
          }
        }

        return status(201);
      }, {
        body: createProductBodySchema,
        response: {
          400: t.Pick(errorResponseSchema, ['summary', 'detail']),
          403: t.Pick(errorResponseSchema, ['summary']),
          404: t.Pick(errorResponseSchema, ['summary']),
        },
        detail: {
          summary: productSummary.create,
          description: productDescription.create,
        },
        tags: productTags,
      })
      .patch('/:id', async ({ body, params, userId }) => {
        const result = await updateProduct.execute({
          userId,
          productId: params.id,
          product: body,
        });

        if (result.isErr()) {
          const error = result.error;

          switch (error.reason) {
            case 'user-not-found':
              return status(404, { summary: 'User not found' });
            case 'user-not-seller':
              return status(403, { summary: 'User is not a seller' });
            case 'product-not-found':
              return status(404, { summary: 'Product not found' });
            case 'forbidden':
              return status(403, { summary: 'You do not own this product' });
            case 'category-not-found':
              return status(404, { summary: 'Category not found' });
            case 'invalid-product-attributes':
              return status(400, {
                summary: 'Invalid product attributes',
                detail: JSON.stringify(error.error),
              });
          }
        }

        return status(200);
      }, {
        params: productIdParamsSchema,
        body: updateProductBodySchema,
        response: {
          400: t.Pick(errorResponseSchema, ['summary', 'detail']),
          403: t.Pick(errorResponseSchema, ['summary']),
          404: t.Pick(errorResponseSchema, ['summary']),
        },
        detail: {
          summary: productSummary.update,
          description: productDescription.update,
        },
        tags: productTags,
      })
      .delete('/:id', async ({ params, userId }) => {
        const result = await deleteProduct.execute({
          userId,
          productId: params.id,
        });

        if (result.isErr()) {
          switch (result.error) {
            case 'user-not-found':
              return status(404, { summary: 'User not found' });
            case 'user-not-seller':
              return status(403, { summary: 'User is not a seller' });
            case 'product-not-found':
              return status(404, { summary: 'Product not found' });
            case 'forbidden':
              return status(403, { summary: 'You do not own this product' });
          }
        }

        return status(204);
      }, {
        params: productIdParamsSchema,
        response: {
          204: t.Void(),
          403: t.Pick(errorResponseSchema, ['summary']),
          404: t.Pick(errorResponseSchema, ['summary']),
        },
        detail: {
          summary: productSummary.delete,
          description: productDescription.delete,
        },
        tags: productTags,
      })
    )
    .use(deriveUserId)
    .get('/feed', async ({ query, visitorId, userId }) => {
      const result = await getPersonalFeed.execute({
        visitorId,
        userId,
        page: query.page,
        limit: query.limit,
      });

      if (result.isErr()) {
        switch (result.error.reason) {
          case 'user-not-found':
            return status(404, { summary: 'User not found' });
          case 'limit-too-large':
            return status(400, { summary: 'Requested limit is too large' });
        }
      }

      return status(200, result.value);
    }, {
      query: getPersonalFeedQuerySchema,
      response: {
        200: productFeedListSchema,
        400: t.Pick(errorResponseSchema, ['summary']),
        404: t.Pick(errorResponseSchema, ['summary']),
      },
      detail: {
        summary: productSummary.getPersonalFeed,
        description: productDescription.getPersonalFeed,
      },
      tags: productTags,
    })
    .post('/events', async ({ body, visitorId, userId }) => {
      const result = await createUserProductEvent.execute({
        ...body,
        visitorId,
        userId
      });

      if (result.isErr()) {
        switch (result.error) {
          case 'user-not-found':
            return status(404, { summary: 'User not found' });
          case 'product-not-found':
            return status(404, { summary: 'Product not found' });
        }
      }

      return status(201);
    }, {
      body: createUserProductEventBodySchema,
      response: {
        201: t.Void(),
        404: t.Pick(errorResponseSchema, ['summary']),
      },
      detail: {
        summary: productSummary.createUserEvent,
        description: productDescription.createUserEvent,
      },
      tags: productTags,
    })
    .use(cron({
      name: 'Recalculate dirty products popularity',
      pattern: '*/10 * * * *',
      run: async () => {
        await recalculateDirtyProductsPopularity.execute();
      },
    }))
}

