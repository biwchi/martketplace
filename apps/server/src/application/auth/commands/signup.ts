import "reflect-metadata";
import { injectable, inject } from "inversify";
import { Result, err, ok } from "neverthrow";

import { NEW_ENTITY_ID } from "@domain/common";
import {
  User,
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
  type PasswordHasher,
  type RefreshTokenHasher,
  type SignupInputDto,
  JWT_PORT_TOKEN,
  PASSWORD_HASHER_PORT_TOKEN,
  REFRESH_TOKEN_HASHER_PORT_TOKEN,
} from "@application/auth";

export type SignupError = "email-already-used";

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
    const existingUser = await this.userRepository.findByEmail(input.email);

    if (existingUser) {
      return err("email-already-used");
    }

    const now = new Date();
    const passwordHash = await this.passwordHasher.hash(input.password);

    const user = User.create({
      id: NEW_ENTITY_ID,
      email: input.email,
      passwordHash,
    });

    const createdUser = await this.userRepository.create(user);

    const refreshExpiresAt = new Date(
      now.getTime() + REFRESH_TOKEN_TTL_MS,
    );
    const accessExpiresAt = new Date(
      now.getTime() + ACCESS_TOKEN_TTL_MS,
    );

    const refreshTokenJwt = await this.jwt.signRefreshToken(
      { userId: createdUser.id },
      { expiresAt: refreshExpiresAt },
    );
    const tokenHash = await this.refreshTokenHasher.hash(refreshTokenJwt);

    await this.refreshTokenRepository.create(RefreshToken.create({
      id: NEW_ENTITY_ID,
      userId: createdUser.id,
      tokenHash,
      createdAt: now,
      expiresAt: refreshExpiresAt,
    }));

    const accessToken = await this.jwt.signAccessToken(
      { userId: createdUser.id },
      { expiresAt: accessExpiresAt },
    );

    return ok({
      accessToken,
      refreshToken: refreshTokenJwt,
    });
  }
}

