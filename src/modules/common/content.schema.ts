import { successResponse, errorResponse } from "../../utils/schema/common.schema.js";

/**
 * 📋 Common Content Schemas
 */

export const getSystemContentSchema = {
  tags: ["Common"],
  summary: "Get all common system content",
  description: "Retrieves terms of service, privacy policy, and other static content.",
  response: {
    200: successResponse,
    500: errorResponse
  }
};

export const getContentByKeySchema = {
  tags: ["Common"],
  summary: "Get content by key (terms, privacy, about)",
  description: "Retrieves a specific content block by its unique key.",
  params: {
    type: "object",
    required: ["key"],
    properties: {
      key: { type: "string", example: "terms" }
    }
  },
  response: {
    200: successResponse,
    404: errorResponse
  }
};
