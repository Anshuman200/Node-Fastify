/**
 * 📋 Unified Health & Metrics Schemas
 * Note: Properties must be explicitly defined for Fastify serialization to work.
 */

const QueueStatsSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    isReady: { type: "boolean" },
    waiting: { type: "number" },
    active: { type: "number" },
    failed: { type: "number" },
    completed: { type: "number" }
  }
};

export const healthSchema = {
  tags: ["System Health"],
  summary: "Comprehensive System Health Check",
  description: "Returns the operational status of the API, Database, Redis, and all background queues.",
  response: {
    200: {
      type: "object",
      properties: {
        status: { type: "string", example: "ok" },
        timestamp: { type: "string" },
        services: {
          type: "object",
          properties: {
            database: { type: "string", example: "connected" },
            redis: { type: "string", example: "connected" },
            queues: {
              type: "object",
              properties: {
                status: { type: "string", example: "ready" },
                details: { 
                  type: "array", 
                  items: QueueStatsSchema 
                }
              }
            }
          }
        }
      }
    }
  }
};

export const metricsSchema = {
  tags: ["System Health"],
  summary: "Queue Metrics",
  description: "Detailed job statistics and queue lengths.",
  response: {
    200: {
      type: "object",
      properties: {
        timestamp: { type: "string" },
        queues: { 
          type: "object",
          properties: {
            email: QueueStatsSchema,
            notification: QueueStatsSchema,
            analytics: QueueStatsSchema
          }
        }
      }
    }
  }
};

export const schemas = {
  healthSchema,
  metricsSchema
};
