import { FastifyInstance } from "fastify";

/**
 * ⚡ Redis Cache Helpers
 * Implementation of Cache-Aside pattern.
 */

export const cacheUtil = (app: FastifyInstance) => {
  const { redis } = app;

  return {
    /**
     * Get data from cache
     */
    async getCache<T>(key: string): Promise<T | null> {
      try {
        const data = await redis.get(key);
        if (!data) return null;
        return JSON.parse(data) as T;
      } catch (error) {
        app.log.error(error, `Cache Get Error [${key}]`);
        return null;
      }
    },

    /**
     * Set data in cache with TTL
     */
    async setCache(key: string, value: any, ttl: number = 3600): Promise<void> {
      try {
        const stringValue = JSON.stringify(value);
        await redis.set(key, stringValue, "EX", ttl);
      } catch (error) {
        app.log.error(error, `Cache Set Error [${key}]`);
      }
    },

    /**
     * Delete multiple keys by pattern
     */
    async deleteByPattern(pattern: string): Promise<void> {
      try {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(keys);
        }
      } catch (error) {
        app.log.error(error, `Cache Delete Pattern Error [${pattern}]`);
      }
    }
  };
};
