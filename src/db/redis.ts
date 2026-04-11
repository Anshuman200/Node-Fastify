import { Redis } from "ioredis";
import { FastifyBaseLogger } from "fastify";

interface RedisConfig {
    host: string;
    port: number | string;
    username?: string;
    password?: string;
}

export async function connectRedis(config: RedisConfig, logger: FastifyBaseLogger) {
    const client = new Redis({
        host: config.host,
        port: Number(config.port),
        username: config.username,
        password: config.password,

        maxRetriesPerRequest: 1,
        enableReadyCheck: true,
        lazyConnect: true, // connect immediately
    });

    try {
        await client.ping();
        logger.info("✅ Redis connected");

        return client;
    } catch (error:any) {
        logger.error("❌ Redis connection failed", error);
        throw error;
    }
}

export async function disconnectRedis(client: Redis, logger: FastifyBaseLogger) {
    try {
        await client.quit();
        logger.info("🛑 Redis disconnected");
    } catch (error: any) {
        logger.error("❌ Redis disconnect error", error);
    }
}