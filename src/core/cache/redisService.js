// services/redisService.js

/**
 * Get data from Redis cache
 * @param {Object} redisClient - The ioredis client instance
 * @param {String} key - The cache key
 * @returns {Object|null} The parsed JSON data or null if not found
 */
export const getCachedData = async (redisClient, key) => {
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
 * @param {Object} redisClient - The ioredis client instance
 * @param {String} key - The cache key
 * @param {Object} data - The data to cache
 * @param {Number} ttl - Time to live in seconds
 */
export const setCachedData = async (redisClient, key, data, ttl = 60) => {
    try {
        await redisClient.set(key, JSON.stringify(data), "EX", ttl);
    } catch (error) {
        console.error(`Redis Set Error [${key}]:`, error);
    }
};

/**
 * Delete data from Redis cache
 * @param {Object} redisClient - The ioredis client instance
 * @param {String} key - The cache key
 */
export const deleteCachedData = async (redisClient, key) => {
    try {
        await redisClient.del(key);
    } catch (error) {
        console.error(`Redis Delete Error [${key}]:`, error);
    }
};

/**
 * Invalidate all Redis cache (or a specific pattern if implemented later)
 * @param {Object} redisClient - The ioredis client instance
 */
export const invalidateCache = async (redisClient) => {
    try {
        await redisClient.flushall();
    } catch (error) {
        console.error("Redis Flush Error:", error);
    }
};
