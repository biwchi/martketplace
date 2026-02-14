import type { JwtPort, LogoutInputDto, RefreshTokenHasher } from '@application/auth'
import type { RefreshTokenRepository } from '@domain/auth'
import type { Result } from 'neverthrow'

import {
  JWT_PORT_TOKEN,

  REFRESH_TOKEN_HASHER_PORT_TOKEN,

} from '@application/auth'
import {
  REFRESH_TOKEN_REPOSITORY_TOKEN,

} from '@domain/auth'

import { inject, injectable } from 'inversify'
import { err, ok } from 'neverthrow'

export type LogoutError = 'invalid-token' | 'token-not-found'

@injectable()
export class Logout {
  constructor(
    @inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @inject(JWT_PORT_TOKEN)
    private readonly jwt: JwtPort,
    @inject(REFRESH_TOKEN_HASHER_PORT_TOKEN)
    private readonly refreshTokenHasher: RefreshTokenHasher,
  ) { }

  async execute(
    input: LogoutInputDto,
  ): Promise<Result<null, LogoutError>> {
    const decoded = await this.jwt.verifyRefreshToken(input.refreshToken)

    if (!decoded) {
      return err('invalid-token')
    }

    const tokenHash = this.refreshTokenHasher.hash(input.refreshToken)
    const existingToken = await this.refreshTokenRepository.findByTokenHash(
      tokenHash,
    )

    if (!existingToken) {
      return err('token-not-found')
    }

    await this.refreshTokenRepository.deleteByTokenHash(tokenHash)

    return ok(null)
  }
}
