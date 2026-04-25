import { FastifyReply, FastifyRequest } from "fastify";
import { responseUtil } from "../../utils/response/response.util.js";

/**
 * 🚦 Custom Rate Limiter (Redis-backed)
 * Supports per-user or per-IP limiting
 */

export const customRateLimit = (
  limit: number,
  windowInSeconds: number = 60
) => {
  return async (request: FastifyRequest, reply: FastifyReply) => {
    const redis = request.server.redis;

    try {
      // 👇 Identify user or fallback to IP
      const userId = (request as any).user?.id;
      const key = userId
        ? `rate:user:${userId}`
        : `rate:ip:${request.ip}`;

      // 👇 Increment request count
      const current = await redis.incr(key);

      // 👇 Set expiry on first request
      if (current === 1) {
        await redis.expire(key, windowInSeconds);
      }

      // 🚫 Limit exceeded
      if (current > limit) {
        return reply.code(429).send(
          responseUtil.error("Too many requests. Please try again later.")
        );
      }

      // ✅ Optional: Add headers (good practice)
      reply.header("X-RateLimit-Limit", limit);
      reply.header("X-RateLimit-Remaining", Math.max(0, limit - current));
      reply.header("X-RateLimit-Reset", windowInSeconds);

    } catch (err: any) {
      request.log.error("Rate limit error:", err);
      // Fail open (don’t block request if Redis fails)
    }
  };
};