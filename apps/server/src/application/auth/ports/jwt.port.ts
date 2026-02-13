export interface JwtSignOptions {
  expiresAt: Date;
}

export interface JwtPort {
  signAccessToken(
    payload: { userId: number },
    options: JwtSignOptions,
  ): Promise<string>;
  signRefreshToken(
    payload: { userId: number },
    options: JwtSignOptions,
  ): Promise<string>;
  verifyRefreshToken(token: string): Promise<{ userId: number } | null>;
  verifyAccessToken(token: string): Promise<{ userId: number } | null>;
}

export const JWT_PORT_TOKEN = Symbol.for("JwtPort");

