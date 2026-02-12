import type { JwtPort, JwtSignOptions } from '@application/auth';
import { sign, verify } from 'jsonwebtoken';

export class JwtAdapter implements JwtPort {
  private readonly accessTokenSecret = Bun.env.JWT_ACCESS_TOKEN_SECRET!;
  private readonly refreshTokenSecret = Bun.env.JWT_REFRESH_TOKEN_SECRET!;

  constructor() {
    if (!this.accessTokenSecret || !this.refreshTokenSecret) {
      throw new Error('JWT_ACCESS_TOKEN_SECRET and JWT_REFRESH_TOKEN_SECRET must be set');
    }
  }

  public async signAccessToken(payload: { userId: number; }, options: JwtSignOptions): Promise<string> {
    return sign(
      payload,
      this.accessTokenSecret,
      {
        expiresIn: options.expiresAt.getTime() - Date.now(),
      }
    );
  }

  public async signRefreshToken(payload: { userId: number; }, options: JwtSignOptions): Promise<string> {
    return sign(
      payload,
      this.refreshTokenSecret,
      {
        expiresIn: options.expiresAt.getTime() - Date.now(),
      }
    );
  }

  public async verifyRefreshToken(token: string): Promise<{ userId: number } | null> {
    return verify(token, this.refreshTokenSecret) as { userId: number } | null;
  }
}