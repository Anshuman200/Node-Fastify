import { successResponse } from "../../utils/schema/common.schema.js";

/**
 * 📋 Health Module Schemas
 */

export const healthSchema = {
  tags: ["DB Health"],
  summary: "System Health Check",
  description: "Returns the operational status of the API, Database, and Redis.",
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        db: { type: "string", example: "Connected" },
        redis: { type: "string", example: "Connected" },
        uptime: { type: "number", example: 123.45 }
      }
    }
  }
};
