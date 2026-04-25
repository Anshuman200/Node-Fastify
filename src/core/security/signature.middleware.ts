import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import { responseUtil } from "../../utils/response/response.util.js";

/**
 * ✍️ Signature Middleware (Production Ready)
 * - HMAC SHA256 verification
 * - Replay protection (Redis)
 * - Stable payload generation
 */

export const verifySignature = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  try {
    const signature = request.headers["x-signature"];
    const timestamp = request.headers["x-timestamp"];

    // 🔐 Validate headers
    if (
      !signature ||
      typeof signature !== "string" ||
      !timestamp ||
      typeof timestamp !== "string"
    ) {
      return reply.code(401).send(
        responseUtil.error("Invalid signature headers")
      );
    }

    // ⏱️ Validate timestamp (5 sec window)
    const now = Math.floor(Date.now() / 1000);
    const requestTime = Number(timestamp);

    if (!Number.isFinite(requestTime) || Math.abs(now - requestTime) > 5) {
      return reply.code(401).send(
        responseUtil.error("Request expired")
      );
    }

    const redis = request.server.redis;

    // 🔁 Replay protection
    const nonceKey = `sig:${timestamp}:${signature}`;
    const alreadyUsed = await redis.get(nonceKey);

    if (alreadyUsed) {
      return reply.code(401).send(
        responseUtil.error("Replay attack detected")
      );
    }

    // 🔒 Normalize URL (remove query + trailing slash)
    const url = normalizePath(request.url);

    const method = request.method.toUpperCase();

    // 🔧 Stable body stringify
    const body =
      request.body && typeof request.body === "object"
        ? JSON.stringify(sortObjectKeys(request.body))
        : "";

    // 🧠 Canonical payload
    const payload = `${method}:${url}:${body}:${timestamp}`;

    // 🔐 Generate expected signature
    const secret = request.server.secrets.SIGNATURE_SECRET;

    const expected = crypto
      .createHmac("sha256", secret)
      .update(payload)
      .digest("hex");

    // 🔐 Timing-safe compare
    const isValid =
      signature.length === expected.length &&
      crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expected)
      );

    if (!isValid) {
      return reply.code(401).send(
        responseUtil.error("Invalid signature")
      );
    }

    // ✅ Mark as used (TTL slightly higher than window)
    await redis.set(nonceKey, "1", "EX", 10);

  } catch (err) {
    request.log.warn("Signature verification failed");

    return reply.code(401).send(
      responseUtil.error("Unauthorized")
    );
  }
};

/**
 * 🔧 Normalize URL (consistent signature)
 */
function normalizePath(url: string): string {
  return url
    .split("?")[0]        // remove query params
    .replace(/\/+$/, "") // remove trailing slash
    || "/";
}

/**
 * 🔧 Stable JSON stringify (sorted keys)
 */
function sortObjectKeys(obj: any): any {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }

  if (obj !== null && typeof obj === "object") {
    return Object.keys(obj)
      .sort()
      .reduce((acc: any, key) => {
        acc[key] = sortObjectKeys(obj[key]);
        return acc;
      }, {});
  }

  return obj;
}