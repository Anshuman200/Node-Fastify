import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { connectRedis, disconnectRedis } from "../db/redis.js";

export default fp(async function redisPlugin(app: FastifyInstance) {
    const config = {
        host: process.env.REDIS_HOST as string,
        port: process.env.REDIS_PORT as string,
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
    };

    try {
        const client = await connectRedis(config, app.log);

        app.decorate("redis", client);

    } catch (error) {
        app.log.error("❌ Unable to connect Redis");
        process.exit(1);
    }

    app.addHook("onClose", async (app) => {
        await disconnectRedis(app.redis, app.log);
    });

}, { name: "@fastify/redis" });