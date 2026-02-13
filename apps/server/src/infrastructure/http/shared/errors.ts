
import { t } from 'elysia';

export const errorResponseSchema = t.Object({
  type: t.String(),
  summary: t.String(),
  status: t.Number(),
  detail: t.Optional(t.String()),
  cause: t.Optional(t.Any()),
  stack: t.Optional(t.String()),
})

export type ErrorResponse = typeof errorResponseSchema.static

export class UnauthorizedError extends Error {
  constructor(message: string = 'Unauthorized') {
    super(message)
    this.name = 'UnauthorizedError'
  }
}
export class BadRequestError extends Error {
  constructor(message: string = 'Bad Request') {
    super(message)
    this.name = 'BadRequestError'
  }
}
export class ForbiddenError extends Error {
  constructor(message: string = 'Forbidden') {
    super(message)
    this.name = 'ForbiddenError'
  }
}