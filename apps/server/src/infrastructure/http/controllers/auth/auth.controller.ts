import type { Login, Logout, RefreshAuthToken, Signup } from '@application/auth';
import Elysia, { status, t } from 'elysia';
import {
  authLoginSchema,
  authLogoutSchema,
  authRefreshTokenInputSchema,
  authSignupSchema,
  authTokensSchema,
} from './auth.controller-schema';
import { authDescription, authSummary, authTags } from './auth.docs';
import { errorResponseSchema } from '@infrastructure/http/shared';

interface Dependencies {
  login: Login,
  signup: Signup,
  logout: Logout,
  refreshToken: RefreshAuthToken,
}

export function createAuthController(dependencies: Dependencies) {
  const {
    login,
    signup,
    logout,
    refreshToken,
  } = dependencies;

  return new Elysia({ prefix: '/auth' })
    .post('/login', async ({ body }) => {
      const result = await login.execute(body);

      if (result.isErr()) {
        switch (result.error) {
          case 'email-not-found':
            return status(404, { summary: 'Email not found' })
          case 'invalid-credentials':
            return status(401, { summary: 'Invalid credentials' })
        }
      }

      return status(200, result.value)
    }, {
      body: authLoginSchema,
      response: {
        200: authTokensSchema,
        404: t.Pick(errorResponseSchema, ['summary']),
        401: t.Pick(errorResponseSchema, ['summary']),
      },
      detail: {
        summary: authSummary.login,
        description: authDescription.login
      },
      tags: authTags
    })
    .post('/signup', async ({ body }) => {
      const result = await signup.execute(body);

      if (result.isErr()) {
        switch (result.error) {
          case 'email-already-used':
            return status(400, { summary: 'Email already used' })
        }
      }

      return status(200, result.value)
    }, {
      body: authSignupSchema,
      response: {
        200: authTokensSchema,
        400: t.Pick(errorResponseSchema, ['summary']),
      },
      detail: {
        summary: authSummary.signup,
        description: authDescription.signup
      },
      tags: authTags
    })
    .post('/logout', async ({ body }) => {
      const result = await logout.execute(body);

      if (result.isErr()) {
        switch (result.error) {
          case 'token-not-found':
            return status(400, { summary: 'Refresh token not found' })
          case 'invalid-token':
            return status(400, { summary: 'Invalid token' })
        }
      }

      return status(200)
    }, {
      body: authLogoutSchema,
      response: {
        400: t.Pick(errorResponseSchema, ['summary']),
      },
      detail: {
        summary: authSummary.logout,
        description: authDescription.logout
      },
      tags: authTags
    })
    .post('/refresh-token', async ({ body }) => {
      const result = await refreshToken.execute(body);

      if (result.isErr()) {
        switch (result.error) {
          case 'invalid-token':
            return status(400, { summary: 'Invalid token' })
          case 'token-not-found':
            return status(400, { summary: 'Refresh token not found' })
          case 'token-expired':
            return status(400, { summary: 'Refresh token expired' })
        }
      }

      return status(200, result.value)
    }, {
      body: authRefreshTokenInputSchema,
      response: {
        200: authTokensSchema,
        400: t.Pick(errorResponseSchema, ['summary']),
      },
      detail: {
        summary: authSummary.refreshToken,
        description: authDescription.refreshToken
      },
      tags: authTags
    })
}