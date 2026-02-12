import { t } from 'elysia';

export const authTokensSchema = t.Object({
  accessToken: t.String(),
  refreshToken: t.String(),
})

export const authLoginSchema = t.Object({
  email: t.String(),
  password: t.String(),
})

export const authLogoutSchema = t.Object({
  refreshToken: t.String(),
})

export const authRefreshTokenInputSchema = t.Object({
  refreshToken: t.String(),
})

export const authSignupSchema = authLoginSchema