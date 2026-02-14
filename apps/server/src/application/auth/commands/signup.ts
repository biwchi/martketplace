import type { AuthTokensDto, JwtPort, PasswordHasher, RefreshTokenHasher, SignupInputDto } from '@application/auth'
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
  User,
  USER_REPOSITORY_TOKEN,

} from '@domain/user'

import { inject, injectable } from 'inversify'
import { err, ok } from 'neverthrow'

export type SignupError = 'email-already-used'

@injectable()
export class Signup {
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

  async execute(
    input: SignupInputDto,
  ): Promise<Result<AuthTokensDto, SignupError>> {
    const existingUser = await this.userRepository.findByEmail(input.email)

    if (existingUser) {
      return err('email-already-used')
    }

    const now = new Date()
    const passwordHash = this.passwordHasher.hash(input.password)

    const user = User.create({
      id: NEW_ENTITY_ID,
      email: input.email,
      passwordHash,
    })

    const createdUser = await this.userRepository.create(user)

    const refreshExpiresAt = new Date(
      now.getTime() + REFRESH_TOKEN_TTL_MS,
    )
    const accessExpiresAt = new Date(
      now.getTime() + ACCESS_TOKEN_TTL_MS,
    )

    const refreshTokenJwt = await this.jwt.signRefreshToken(
      { userId: createdUser.id },
      { expiresAt: refreshExpiresAt },
    )
    const tokenHash = this.refreshTokenHasher.hash(refreshTokenJwt)

    await this.refreshTokenRepository.create(RefreshToken.create({
      id: NEW_ENTITY_ID,
      userId: createdUser.id,
      tokenHash,
      createdAt: now,
      expiresAt: refreshExpiresAt,
    }))

    const accessToken = await this.jwt.signAccessToken(
      { userId: createdUser.id },
      { expiresAt: accessExpiresAt },
    )

    return ok({
      accessToken,
      refreshToken: refreshTokenJwt,
    })
  }
}
