import Elysia, { InternalServerError, } from 'elysia';
import { UnauthorizedError } from '../shared/errors';
import type { HttpStore } from '../setup';
import { err, ok, type Result } from 'neverthrow';
import type { JwtPort } from '@application/auth';


type ValidationResult = Result<{ userId: number }, 'unauthorized' | 'invalid-token'>

async function validate(jwt: JwtPort, headers: Record<string, string | undefined>): Promise<ValidationResult> {
  const authorization = headers['authorization']
  const [type, token] = authorization?.split(' ') ?? []

  if (type !== 'Bearer' || !token) {
    return err('unauthorized')
  }

  try {
    const result = await jwt.verifyAccessToken(token)
    if (!result) {
      return err('unauthorized')
    }

    return ok({ userId: result.userId })
  } catch (error) {
    return err('invalid-token')
  }
}

export const authMiddleware = new Elysia({ name: 'AppAuthMiddleware' })
  .resolve(async ({ headers, store }) => {
    const _store = store as HttpStore

    if (!_store.jwt) {
      throw new InternalServerError('JWT service is not initialized')
    }

    const result = await validate(_store.jwt, headers)

    if (result.isErr()) {
      switch (result.error) {
        case 'unauthorized':
          throw new UnauthorizedError()
        case 'invalid-token':
          throw new UnauthorizedError()
      }
    }

    return result.value
  })
  .as('scoped')

export const deriveUserId = new Elysia({ name: 'DeriveUserId' })
  .derive(async ({ headers, store }) => {
    const _store = store as HttpStore

    if (!_store.jwt) {
      throw new InternalServerError('JWT service is not initialized')
    }

    const result = await validate(_store.jwt, headers)

    return {
      userId: result.isOk() ? result.value.userId : undefined,
    }
  })
  .as('scoped');
