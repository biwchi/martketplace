import type { AuthTokensDto, JwtPort, LoginInputDto, PasswordHasher, RefreshTokenHasher } from '@application/auth'
import type { RefreshTokenRepository } from '@domain/auth'
import type { UserRepository } from '@domain/user'

import type { Result } from 'neverthrow'
import {
  ACCESS_TOKEN_TTL_MS,

  JWT_PORT_TOKEN,

  PASSWORD_HASHER_PORT_TOKEN,

  REFRESH_TOKEN_HASHER_PORT_TOKEN,
  REFRESH_TOKEN_TTL_MS,

} from '@application/auth'
import {
  REFRESH_TOKEN_REPOSITORY_TOKEN,
  RefreshToken,

} from '@domain/auth'
import { NEW_ENTITY_ID } from '@domain/common'
import {
  USER_REPOSITORY_TOKEN,

} from '@domain/user'

import { inject, injectable } from 'inversify'
import { err, ok } from 'neverthrow'

export type LoginError
  = | 'invalid-credentials'
    | 'email-not-found'

@injectable()
export class Login {
  constructor(
    @inject(USER_REPOSITORY_TOKEN)
    private readonly userRepository: UserRepository,
    @inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @inject(JWT_PORT_TOKEN)
    private readonly jwt: JwtPort,
    @inject(PASSWORD_HASHER_PORT_TOKEN)
    private readonly passwordHasher: PasswordHasher,
    @inject(REFRESH_TOKEN_HASHER_PORT_TOKEN)
    private readonly refreshTokenHasher: RefreshTokenHasher,
  ) { }

  async execute(input: LoginInputDto): Promise<Result<AuthTokensDto, LoginError>> {
    const user = await this.userRepository.findByEmail(input.email)

    if (!user) {
      return err('email-not-found')
    }

    const passwordMatches = this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    )

    if (!passwordMatches) {
      return err('invalid-credentials')
    }

    const now = new Date()
    const refreshExpiresAt = new Date(
      now.getTime() + REFRESH_TOKEN_TTL_MS,
    )
    const accessExpiresAt = new Date(
      now.getTime() + ACCESS_TOKEN_TTL_MS,
    )

    const refreshTokenJwt = await this.jwt.signRefreshToken(
      { userId: user.id },
      { expiresAt: refreshExpiresAt },
    )
    const tokenHash = this.refreshTokenHasher.hash(refreshTokenJwt)

    await this.refreshTokenRepository.create(RefreshToken.create({
      id: NEW_ENTITY_ID,
      userId: user.id,
      tokenHash,
      createdAt: now,
      expiresAt: refreshExpiresAt,
    }))

    const accessToken = await this.jwt.signAccessToken(
      { userId: user.id },
      { expiresAt: accessExpiresAt },
    )

    return ok({
      accessToken,
      refreshToken: refreshTokenJwt,
    })
  }
}
