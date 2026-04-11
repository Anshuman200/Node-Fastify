import { Redis } from "ioredis";

/**
 * Get data from Redis cache
 * @param {Redis} redisClient - The ioredis client instance
 * @param {string} key - The cache key
 * @returns {Promise<any|null>} The parsed JSON data or null if not found
 */
export const getCachedData = async (redisClient: Redis, key: string): Promise<any | null> => {
    try {
        const data = await redisClient.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Redis Get Error [${key}]:`, error);
        return null; // Return null on error so the app can fallback to DB
    }
};

/**
 * Set data in Redis cache
 * @param {Redis} redisClient - The ioredis client instance
 * @param {string} key - The cache key
 * @param {any} data - The data to cache
 * @param {number} ttl - Time to live in seconds
 */
export const setCachedData = async (redisClient: Redis, key: string, data: any, ttl = 60): Promise<void> => {
    try {
        await redisClient.set(key, JSON.stringify(data), "EX", ttl);
    } catch (error) {
        console.error(`Redis Set Error [${key}]:`, error);
    }
};

/**
 * Delete data from Redis cache
 * @param {Redis} redisClient - The ioredis client instance
 * @param {string} key - The cache key
 */
export const deleteCachedData = async (redisClient: Redis, key: string): Promise<void> => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error(`Redis Delete Error [${key}]:`, error);
    }
};

/**
 * Invalidate all Redis cache (or a specific pattern if implemented later)
 * @param {Redis} redisClient - The ioredis client instance
 */
export const invalidateCache = async (redisClient: Redis): Promise<void> => {
    try {
        await redisClient.flushall();
    } catch (error) {
        console.error("Redis Flush Error:", error);
    }
};
