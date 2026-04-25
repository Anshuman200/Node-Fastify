import { FastifyReply, FastifyRequest } from "fastify";
import crypto from "crypto";
import { responseUtil } from "../../utils/response/response.util.js";

export const verifyApiKey = async (
  request: FastifyRequest,
  reply: FastifyReply
) => {
  const apiKey = request.headers["x-api-key"] as string;

  if (!apiKey) {
    return reply.code(401).send(responseUtil.error("API Key is missing"));
  }

  const keys = request.server.secrets.API_KEYS as Record<string, string>;

  let matchedClient: string | null = null;

  for (const [client, key] of Object.entries(keys)) {
    const isMatch =
      apiKey.length === key.length &&
      crypto.timingSafeEqual(
        Buffer.from(apiKey),
        Buffer.from(key)
      );

    if (isMatch) {
      matchedClient = client;
      break;
    }
  }

  if (!matchedClient) {
    return reply.code(403).send(responseUtil.error("Invalid API Key"));
  }

  request.client = matchedClient;
};