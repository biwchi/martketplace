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

  private verifyPayload(payload: unknown): { userId: number } | null {
    if (typeof payload !== 'object' || payload === null) {
      return null;
    }

    if (!('userId' in payload) || typeof payload.userId !== 'number') {
      return null;
    }

    return { userId: payload.userId };
  }

  public async verifyRefreshToken(token: string): Promise<{ userId: number } | null> {
    return this.verifyPayload(verify(token, this.refreshTokenSecret))
  }

  public async verifyAccessToken(token: string): Promise<{ userId: number } | null> {
    return this.verifyPayload(verify(token, this.accessTokenSecret))
  }
}