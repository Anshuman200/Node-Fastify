/**
 * 🧱 Common Reusable Schemas
 * Standardized response structures for the entire API.
 */

export const successResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    data: { type: 'object', additionalProperties: true }
  }
} as const;

export const errorResponse = {
  type: 'object',
  properties: {
    success: { type: 'boolean' },
    message: { type: 'string' },
    error: { type: 'string' }
  }
} as const;

export const paginationResponse = {
  type: 'object',
  properties: {
    ...successResponse.properties,
    pagination: {
      type: 'object',
      properties: {
        total: { type: 'integer' },
        page: { type: 'integer' },
        limit: { type: 'integer' },
        totalPages: { type: 'integer' }
      }
    }
  }
} as const;

// 🛡️ Security Response Schemas
// Note: These must strictly be the Body schema
export const unauthorizedResponse = errorResponse;
export const forbiddenResponse = errorResponse;
export const rateLimitResponse = errorResponse;
