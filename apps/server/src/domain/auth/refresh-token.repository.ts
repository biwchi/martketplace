import type { RefreshToken } from './refresh-token.entity'

export interface RefreshTokenRepository {
  findByTokenHash: (tokenHash: string) => Promise<RefreshToken | null>
  create: (refreshToken: RefreshToken) => Promise<RefreshToken>
  deleteByTokenHash: (tokenHash: string) => Promise<void>
}

export const REFRESH_TOKEN_REPOSITORY_TOKEN = Symbol.for(
  'RefreshTokenRepository',
)
