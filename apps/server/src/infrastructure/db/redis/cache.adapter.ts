import type { CachePort } from "@application/ports";
import { redis } from "bun";

/**
 * CachePort implementation backed by Bun's built-in Redis client.
 *
 * Uses JSON serialization for values and PX-based TTL in milliseconds.
 */
export class RedisCacheAdapter implements CachePort {
  public async get<T>(key: string): Promise<T | null> {
    const raw = await redis.get(key);
    if (raw == null) {
      return null;
    }

    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  public async set<T>(key: string, value: T, ttlMs: number): Promise<void> {
    const serialized = JSON.stringify(value);
    await redis.set(key, serialized, 'PX', ttlMs);
  }

  public async delete(key: string): Promise<void> {
    await redis.del(key);
  }
}

