import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { connectRedis, disconnectRedis } from "../db/redis.js";

export default fp(async function redisPlugin(app: FastifyInstance) {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;

    if (!host || !port) {
        app.log.error("❌ REDIS_HOST or REDIS_PORT is missing. Ensure it is set in AWS Secrets Manager or .env.");
        process.exit(1);
    }

    const config = {
        host: host as string,
        port: port as string,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
    };

    try {
        const client = await connectRedis(config, app.log);

        app.decorate("redis", client);

    } catch (error: any) {
        app.log.error(`❌ Unable to connect Redis: ${error.message}`);
        process.exit(1);
    }

    app.addHook("onClose", async (app) => {
        await disconnectRedis(app.redis, app.log);
    });

}, { name: "@fastify/redis" });