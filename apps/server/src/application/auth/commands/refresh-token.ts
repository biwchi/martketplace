import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Result, err, fromAsyncThrowable, ok } from "neverthrow";

import { NEW_ENTITY_ID } from "@domain/common";
import {
  RefreshToken,
  type RefreshTokenRepository,
  REFRESH_TOKEN_REPOSITORY_TOKEN,
} from "@domain/auth";

import {
  ACCESS_TOKEN_TTL_MS,
  REFRESH_TOKEN_TTL_MS,
  type AuthTokensDto,
  type JwtPort,
  type RefreshTokenInputDto,
  type RefreshTokenHasher,
  JWT_PORT_TOKEN,
  REFRESH_TOKEN_HASHER_PORT_TOKEN,
} from "@application/auth";

export type RefreshTokenError =
  | "invalid-token"
  | "token-not-found"
  | "token-expired";

@injectable()
export class RefreshAuthToken {
  constructor(
    @inject(REFRESH_TOKEN_REPOSITORY_TOKEN)
    private readonly refreshTokenRepository: RefreshTokenRepository,
    @inject(JWT_PORT_TOKEN)
    private readonly jwt: JwtPort,
    @inject(REFRESH_TOKEN_HASHER_PORT_TOKEN)
    private readonly refreshTokenHasher: RefreshTokenHasher,
  ) { }

  async execute(
    input: RefreshTokenInputDto,
  ): Promise<Result<AuthTokensDto, RefreshTokenError>> {
    const decodedResult = await fromAsyncThrowable(
      () => this.jwt.verifyRefreshToken(input.refreshToken),
      () => "invalid-token"
    )()

    const decoded = decodedResult.isOk() ? decodedResult.value : null;

    if (decodedResult.isErr() || !decoded) {
      return err("invalid-token");
    }

    const tokenHash = await this.refreshTokenHasher.hash(input.refreshToken);
    const existingToken = await this.refreshTokenRepository.findByTokenHash(
      tokenHash,
    );

    if (!existingToken) {
      return err("token-not-found");
    }

    if (existingToken.isExpired) {
      return err("token-expired");
    }

    // rotate refresh token: delete old one, save new one
    const now = new Date();
    const refreshExpiresAt = new Date(
      now.getTime() + REFRESH_TOKEN_TTL_MS,
    );
    const accessExpiresAt = new Date(
      now.getTime() + ACCESS_TOKEN_TTL_MS,
    );

    const refreshTokenJwt = await this.jwt.signRefreshToken(
      { userId: decoded.userId },
      { expiresAt: refreshExpiresAt },
    );

    const newTokenHash = await this.refreshTokenHasher.hash(refreshTokenJwt);
    const newTokenEntity = RefreshToken.create({
      id: NEW_ENTITY_ID,
      userId: decoded.userId,
      tokenHash: newTokenHash,
      createdAt: now,
      expiresAt: refreshExpiresAt,
    });

    await this.refreshTokenRepository.deleteByTokenHash(tokenHash);
    await this.refreshTokenRepository.create(newTokenEntity);

    const accessToken = await this.jwt.signAccessToken(
      { userId: decoded.userId },
      { expiresAt: accessExpiresAt },
    );

    return ok({
      accessToken,
      refreshToken: refreshTokenJwt,
    });
  }
}
