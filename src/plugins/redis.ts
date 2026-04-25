import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import fastifyRedis from "@fastify/redis";
import { env } from "../config/env.js";

/**
 * 🔌 Redis Plugin
 * Integrates Redis for caching, session management, and rate limiting.
 */

export default fp(async function redisPlugin(app: FastifyInstance) {
    await app.register(fastifyRedis, {
        host: env.REDIS_HOST,
        port: env.REDIS_PORT,
        password: env.REDIS_PASSWORD,
        closeClient: true,
    });

    app.log.info("✅ Redis plugin registered");
}, {
    name: "redis",
});