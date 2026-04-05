import Redis from "ioredis";

export async function connectRedis(config, logger) {
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
    } catch (error) {
        logger.error("❌ Redis connection failed", error);
        throw error;
    }
}

export async function disconnectRedis(client, logger) {
    try {
        await client.quit();
        logger.info("🛑 Redis disconnected");
    } catch (error) {
        logger.error("❌ Redis disconnect error", error);
    }
}