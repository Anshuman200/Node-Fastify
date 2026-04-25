import { FastifySchema } from "fastify";
import { successResponse, errorResponse, unauthorizedResponse, rateLimitResponse } from "../../utils/schema/common.schema.js";

/**
 * 📋 Auth Module Schemas (Strictly Typed)
 */

export const loginSchema: FastifySchema = {
  tags: ["User Auth"],
  summary: "Standard user/admin login",
  description: "Authenticates a user and returns access/refresh tokens.",
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "admin@gmail.com" },
      password: { type: "string", minLength: 6, example: "admin123" }
    }
  },
  response: {
    200: {
      ...successResponse,
      properties: {
        ...successResponse.properties,
        data: {
          type: "object",
          properties: {
            user: { type: "object", additionalProperties: true },
            accessToken: { type: "string" },
            refreshToken: { type: "string" }
          }
        }
      }
    },
    401: unauthorizedResponse,
    429: rateLimitResponse
  }
};

export const logoutSchema: FastifySchema = {
  tags: ["User Auth"],
  summary: "Logout user",
  description: "Blacklists the current token and clears user sessions.",
  security: [{ bearerAuth: [] }],
  response: {
    200: successResponse,
    401: unauthorizedResponse
  }
};

export const profileSchema: FastifySchema = {
  tags: ["User Auth"],
  summary: "Get current profile",
  description: "Returns the authenticated user's profile information.",
  security: [
    { bearerAuth: [] },
    { apiKeyAuth: [] },
    { signatureAuth: [] }
  ],
  response: {
    200: {
      ...successResponse,
      properties: {
        ...successResponse.properties,
        data: {
          type: "object",
          properties: {
            user: { type: "object", additionalProperties: true }
          }
        }
      }
    },
    401: unauthorizedResponse
  }
};

export const secureCheckSchema: FastifySchema = {
  tags: ["Admin Auth"],
  summary: "Multi-layer security check",
  description: "Example route requiring JWT, API Key, and HMAC Signature.",
  security: [
    { bearerAuth: [] },
    { apiKeyAuth: [] },
    { signatureAuth: [] }
  ],
  response: {
    200: successResponse,
    401: unauthorizedResponse
  }
};
