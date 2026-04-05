import fp from "fastify-plugin";
import fastifyRateLimit from "@fastify/rate-limit";

export default fp(async function (fastify, opts) {
    await fastify.register(fastifyRateLimit, {
        max: 100,
        timeWindow: "1 minute",
        redis: fastify.redis, // Use existing redis instance
        keyGenerator: (request) => {
            return request.ip; // Default to IP based
        },
        errorResponseBuilder: (request, context) => {
            return {
                statusCode: 429,
                error: "Too Many Requests",
                message: `Rate limit exceeded. Try again in ${context.after}.`,
                date: new Date(),
                expiresIn: context.after
            };
        }
    });
}, {
    name: "rate-limit",
    dependencies: ["@fastify/redis"]
});
