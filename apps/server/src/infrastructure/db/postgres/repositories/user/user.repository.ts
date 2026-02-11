import { eq } from "drizzle-orm";

import { User, type UserRepository } from "@domain/user";
import { db } from "@infrastructure/db/postgres/client";
import { users } from "@infrastructure/db/postgres/schema";

const mapRowToUser = (row: typeof users.$inferSelect): User =>
  User.create({
    id: row.id,
    email: row.email,
    passwordHash: row.passwordHash,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  });

export class PgUserRepository implements UserRepository {
  public async findById(id: number): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!row) {
      return null;
    }

    return mapRowToUser(row);
  }

  public async findByEmail(email: string): Promise<User | null> {
    const [row] = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    if (!row) {
      return null;
    }

    return mapRowToUser(row);
  }

  public async create(user: User): Promise<User> {
    const [row] = await db
      .insert(users)
      .values({
        email: user.email,
        passwordHash: user.passwordHash,
      })
      .returning();

    if (!row) {
      throw new Error("Failed to create user");
    }

    return mapRowToUser(row);
  }
}


