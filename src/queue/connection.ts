import { Redis, RedisOptions } from "ioredis";
import { env } from "../config/env.js";

/**
 * 🔌 BullMQ Connection Strategy
 */

export const getRedisOptions = (): RedisOptions => ({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  maxRetriesPerRequest: null,
  enableReadyCheck: true,
  reconnectOnError: (err) => {
    const targetError = "READONLY";
    if (err.message.includes(targetError)) return true;
    return false;
  },
});

/**
 * 🚜 Standalone connection for Workers
 */
export const createWorkerConnection = () => {
  const connection = new Redis(getRedisOptions());
  
  connection.on("error", (err) => {
    console.error("❌ Worker Redis Connection Error:", err.message);
  });

  return connection;
};

/**
 * 🏥 Check Redis Health
 */
export const checkRedisHealth = async (redis: Redis) => {
  try {
    const status = await redis.ping();
    return status === "PONG";
  } catch (err) {
    return false;
  }
};
