import type { RefreshTokenRepository } from '@domain/auth'
import { RefreshToken } from '@domain/auth'

import { db } from '@infrastructure/db/postgres/client'
import { refreshTokens } from '@infrastructure/db/postgres/schema'
import { eq } from 'drizzle-orm'

export class PgRefreshTokenRepository implements RefreshTokenRepository {
  public async findByTokenHash(
    tokenHash: string,
  ): Promise<RefreshToken | null> {
    const [row] = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1)

    if (!row) {
      return null
    }

    return RefreshToken.create({
      id: row.id,
      userId: row.userId,
      tokenHash: row.tokenHash,
      expiresAt: row.expiresAt,
      createdAt: row.createdAt,
    })
  }

  public async create(refreshToken: RefreshToken): Promise<RefreshToken> {
    const [row] = await db
      .insert(refreshTokens)
      .values({
        userId: refreshToken.userId,
        tokenHash: refreshToken.tokenHash,
        expiresAt: refreshToken.expiresAt,
        createdAt: refreshToken.createdAt,
      })
      .returning({ id: refreshTokens.id })

    if (!row) {
      throw new Error('Failed to create refresh token')
    }

    return refreshToken.update({ id: row.id })
  }

  public async deleteByTokenHash(tokenHash: string): Promise<void> {
    await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
  }
}
