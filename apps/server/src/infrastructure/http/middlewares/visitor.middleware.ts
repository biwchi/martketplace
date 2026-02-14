import { InMemoryCache } from '@infrastructure/common'
import { isValidUUID } from '@shared/utils/uuid'
import Elysia from 'elysia'
import { BadRequestError } from '../shared'

export const visitorMiddleware = new Elysia({ name: 'VisitorMiddleware' })
  .state({
    validUUIDs: new InMemoryCache<string>(60 * 15), // 15 minutes
  })
  .resolve(async ({ headers, store: { validUUIDs } }) => {
    const visitorId = headers['x-visitor-id']

    if (!visitorId) {
      throw new BadRequestError('Provide a valid visitor ID')
    }

    const cachedUUID = validUUIDs.get(visitorId)

    if (cachedUUID) {
      return {
        visitorId: cachedUUID,
      }
    }

    if (!isValidUUID(visitorId)) {
      throw new BadRequestError('Provide a valid visitor ID')
    }

    validUUIDs.set(visitorId, visitorId)

    return {
      visitorId,
    }
  })
  .as('scoped')
