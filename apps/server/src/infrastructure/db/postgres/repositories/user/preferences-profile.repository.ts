import { eq, or } from "drizzle-orm";

import {
  PreferencesProfile,
  type PreferencesProfileRepository,
} from "@domain/user";
import { db } from "@infrastructure/db/postgres/client";
import { preferencesProfile } from "@infrastructure/db/postgres/schema";

const mapRowToPreferencesProfile = (
  row: typeof preferencesProfile.$inferSelect,
): PreferencesProfile =>
  PreferencesProfile.create({
    userId: row.userId ?? undefined,
    visitorId: row.visitorId ?? undefined,
    topCategoryIds: row.topCategoryIds,
    preferredAveragePrice: Number(row.preferredAveragePrice),
  });

export class PgPreferencesProfileRepository implements PreferencesProfileRepository {
  private async findBy(id: number | string, by: "userId" | "visitorId"): Promise<PreferencesProfile | null> {
    if (by === "userId" && typeof id !== "number") {
      throw new Error("userId must be a number");
    }
    if (by === "visitorId" && typeof id !== "string") {
      throw new Error("visitorId must be a string");
    }

    const column = by === "userId"
      ? preferencesProfile.userId
      : preferencesProfile.visitorId;

    const [row] = await db
      .select()
      .from(preferencesProfile)
      .where(
        eq(column, id),
      )
      .limit(1);

    if (!row) {
      return null;
    }

    return mapRowToPreferencesProfile(row);
  }

  public async findByUserId(userId: number): Promise<PreferencesProfile | null> {
    return this.findBy(userId, "userId");
  }

  public async findByVisitorId(visitorId: string): Promise<PreferencesProfile | null> {
    return this.findBy(visitorId, "visitorId");
  }

  public async create(
    preferences: PreferencesProfile,
  ): Promise<PreferencesProfile> {
    const [row] = await db
      .insert(preferencesProfile)
      .values({
        userId: preferences.userId,
        topCategoryIds: preferences.topCategoryIds,
        preferredAveragePrice: preferences.preferredAveragePrice.toString(),
        updatedAt: preferences.updatedAt,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create user preferences");
    }

    return mapRowToPreferencesProfile(row);
  }

  public async update(
    preferences: PreferencesProfile,
  ): Promise<PreferencesProfile> {
    const [row] = await db
      .update(preferencesProfile)
      .set({
        topCategoryIds: preferences.topCategoryIds,
        preferredAveragePrice: preferences.preferredAveragePrice.toString(),
        updatedAt: preferences.updatedAt,
      })
      .where(or(
        preferences.userId ? eq(preferencesProfile.userId, preferences.userId) : undefined,
        preferences.visitorId ? eq(preferencesProfile.visitorId, preferences.visitorId) : undefined,
      ))
      .returning();

    if (!row) {
      throw new Error("Failed to update user preferences");
    }

    return mapRowToPreferencesProfile(row);
  }
}


