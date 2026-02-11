import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Result, err, ok } from "neverthrow";

import { NEW_ENTITY_ID } from "@domain/common";
import {
  type UserRepository,
  USER_REPOSITORY_TOKEN,
} from "@domain/user";
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
  type LoginInputDto,
  type PasswordHasher,
  type RefreshTokenHasher,
  JWT_PORT_TOKEN,
  PASSWORD_HASHER_PORT_TOKEN,
  REFRESH_TOKEN_HASHER_PORT_TOKEN,
} from "@application/auth";

export type LoginError =
  | "invalid-credentials"
  | "user-not-found";

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
    const user = await this.userRepository.findByEmail(input.email);

    if (!user) {
      return err("user-not-found");
    }

    const passwordMatches = await this.passwordHasher.compare(
      input.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      return err("invalid-credentials");
    }

    const now = new Date();
    const refreshExpiresAt = new Date(
      now.getTime() + REFRESH_TOKEN_TTL_MS,
    );
    const accessExpiresAt = new Date(
      now.getTime() + ACCESS_TOKEN_TTL_MS,
    );

    const refreshTokenJwt = await this.jwt.signRefreshToken(
      { userId: user.id },
      { expiresAt: refreshExpiresAt },
    );
    const tokenHash = await this.refreshTokenHasher.hash(refreshTokenJwt);

    await this.refreshTokenRepository.create(RefreshToken.create({
      id: NEW_ENTITY_ID,
      userId: user.id,
      tokenHash,
      createdAt: now,
      expiresAt: refreshExpiresAt,
    }));

    const accessToken = await this.jwt.signAccessToken(
      { userId: user.id },
      { expiresAt: accessExpiresAt },
    );

    return ok({
      accessToken,
      refreshToken: refreshTokenJwt,
    });
  }
}
