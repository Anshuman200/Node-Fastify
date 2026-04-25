import { FastifyReply, FastifyRequest } from "fastify";
import { responseUtil } from "../../utils/response/response.util.js";

/**
 * 🔒 Authentication Middleware (Production Ready)
 */

export const authenticate = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const authHeader = request.headers.authorization;

    // 🔐 Validate header format
    if (!authHeader || typeof authHeader !== "string") {
      return reply
        .code(401)
        .send(responseUtil.error("Authorization header missing"));
    }

    const parts = authHeader.split(" ");

    if (parts.length !== 2 || parts[0] !== "Bearer") {
      return reply
        .code(401)
        .send(responseUtil.error("Invalid authorization format"));
    }

    const token = parts[1];

    // 🚫 Check blacklist FIRST (fast rejection)
    const isBlacklisted = await request.server.redis.get(
      `blacklist:${token}`
    );

    if (isBlacklisted) {
      return reply
        .code(401)
        .send(responseUtil.error("Token has been revoked"));
    }

    // 🔐 Verify JWT
    await request.jwtVerify();

    // ✅ request.user is now available

  } catch (err) {
    request.log.warn("Auth failed");

    return reply
      .code(401)
      .send(responseUtil.error("Unauthorized"));
  }
};