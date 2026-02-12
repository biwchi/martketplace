
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
  constructor() {
    super('Unauthorized')
    this.name = 'UnauthorizedError'
  }
}