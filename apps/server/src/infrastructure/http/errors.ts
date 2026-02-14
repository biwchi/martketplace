import type { ErrorResponse } from './shared'
import Elysia, { status } from 'elysia'
import { JsonWebTokenError, TokenExpiredError } from 'jsonwebtoken'
import { UnauthorizedError } from './shared'

export const errorsHandler = new Elysia()
  .error({
    UNAUTHORIZED: UnauthorizedError,
    TOKEN_EXPIRED: TokenExpiredError,
    JSON_WEB_TOKEN_ERROR: JsonWebTokenError,
  })
  .onError({ as: 'global' }, ({ code, error, request }) => {
    const response: ErrorResponse = {
      status: 500,
      type: 'error',
      summary: 'Internal server error',
    }

    switch (code) {
      case 'NOT_FOUND':
        response.status = 404
        response.type = 'NotFound'
        response.summary = error.message === code
          ? `The ${request.method} ${request.url} route is not found`
          : error.message
        response.stack = error.stack
        break
      case 'PARSE':
        response.type = 'ParseError'
        response.summary = error.message
        response.stack = error.stack
        break
      case 'TOKEN_EXPIRED':
      case 'UNAUTHORIZED':
        response.status = 401
        response.type = error.name
        response.summary = error.message
        break
      case 'UNKNOWN':
      case 'INTERNAL_SERVER_ERROR':
      case 'INVALID_COOKIE_SIGNATURE':
      case 'JSON_WEB_TOKEN_ERROR':
        response.type = error.name
        response.summary = error.message
        response.stack = error.stack
        response.cause = error.cause
        break
      case 'INVALID_FILE_TYPE':
        response.status = 400
        response.type = 'InvalidFileType'
        response.summary = error.message
        response.stack = error.stack
        response.cause = error.cause
        response.detail = `Expected ${Array.isArray(error.expected)
          ? error.expected.join(', ')
          : error.expected}`
        break
        // case 'PG_DATABASE_ERROR':
        //   response.type = 'PgDatabaseError'
        //   response.summary = error.message
        //   response.stack = error.stack
        //   response.cause = error.cause

      //   if (error.code) {
      //     response.detail = `Database error: ${error.code}`
      //   }
      //   break
      case 'VALIDATION':
        request.headers.set('Content-Type', 'application/json')
        return error.detail(error.message)
    }

    console.error(error)

    return status(response.status, response)
  })
