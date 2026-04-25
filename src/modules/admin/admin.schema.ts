import { successResponse, errorResponse, unauthorizedResponse, paginationResponse } from "../../utils/schema/common.schema.js";

/**
 * 📋 Admin Module Schemas (Schema-First)
 */

export const adminLoginSchema = {
  tags: ["Admin Auth"],
  summary: "Admin Login",
  description: "Authenticates an administrator.",
  body: {
    type: "object",
    required: ["email", "password"],
    properties: {
      email: { type: "string", format: "email", example: "admin@gmail.com" },
      password: { type: "string", example: "admin123" }
    }
  },
  response: {
    200: successResponse,
    401: unauthorizedResponse
  }
};

export const adminLogoutSchema = {
  tags: ["Admin Auth"],
  summary: "Logout admin",
  security: [{ bearerAuth: [] }],
  response: {
    200: successResponse,
    401: unauthorizedResponse
  }
};

export const adminProfileSchema = {
  tags: ["Admin Auth"],
  summary: "Get current admin profile",
  security: [{ bearerAuth: [] }],
  response: {
    200: successResponse,
    401: unauthorizedResponse
  }
};

export const getAllUsersSchema = {
  tags: ["Admin Users"],
  summary: "Fetch all users",
  security: [{ bearerAuth: [] }],
  querystring: {
    type: "object",
    properties: {
      page: { type: "number", default: 1 },
      limit: { type: "number", default: 10 },
      status: { type: "string", enum: ["active", "inactive"] },
      isActive: { type: "boolean" },
      userType: { type: "string", enum: ["admin", "user", "guest"] },
      search: { type: "string" }
    }
  },
  response: {
    200: paginationResponse,
    401: unauthorizedResponse
  }
};

export const getSingleUserSchema = {
  tags: ["Admin Users"],
  summary: "Get a user by username",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["userName"],
    properties: {
      userName: { type: "string" }
    }
  },
  response: {
    200: successResponse,
    401: unauthorizedResponse,
    404: errorResponse
  }
};

export const updateUserSchema = {
  tags: ["Admin Users"],
  summary: "Update a user",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["userName"],
    properties: {
      userName: { type: "string" }
    }
  },
  body: {
    type: "object",
    properties: {
      name: { type: "string" },
      email: { type: "string", format: "email" },
      status: { type: "string", enum: ["active", "inactive"] }
    }
  },
  response: {
    200: successResponse,
    401: unauthorizedResponse
  }
};

export const deleteMultipleUsersSchema = {
  tags: ["Admin Users"],
  summary: "Delete multiple users by username",
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["userNames"],
    properties: {
      userNames: {
        type: "array",
        items: { type: "string" }
      }
    }
  },
  response: {
    200: successResponse,
    401: unauthorizedResponse
  }
};

export const deleteSingleUserSchema = {
  tags: ["Admin Users"],
  summary: "Delete a single user by username",
  security: [{ bearerAuth: [] }],
  params: {
    type: "object",
    required: ["userName"],
    properties: {
      userName: { type: "string" }
    }
  },
  response: {
    200: successResponse,
    401: unauthorizedResponse
  }
};

export const verifyOtpSchema = {
  tags: ["Admin Auth"],
  summary: "Verify admin email with OTP",
  body: {
    type: "object",
    required: ["email", "otp"],
    properties: {
      email: { type: "string", format: "email" },
      otp: { type: "string" }
    }
  },
  response: {
    200: successResponse,
    400: errorResponse
  }
};

export const forgotPasswordSchema = {
  tags: ["Admin Auth"],
  summary: "Request admin password reset OTP",
  body: {
    type: "object",
    required: ["email"],
    properties: {
      email: { type: "string", format: "email" }
    }
  },
  response: {
    200: successResponse,
    404: errorResponse
  }
};

export const resetPasswordSchema = {
  tags: ["Admin Auth"],
  summary: "Reset admin password using OTP",
  body: {
    type: "object",
    required: ["email", "otp", "newPassword"],
    properties: {
      email: { type: "string", format: "email" },
      otp: { type: "string" },
      newPassword: { type: "string" }
    }
  },
  response: {
    200: successResponse,
    400: errorResponse
  }
};

export const changePasswordSchema = {
  tags: ["Admin Auth"],
  summary: "Change admin password (authenticated)",
  security: [{ bearerAuth: [] }],
  body: {
    type: "object",
    required: ["oldPassword", "newPassword"],
    properties: {
      oldPassword: { type: "string" },
      newPassword: { type: "string" }
    }
  },
  response: {
    200: successResponse,
    401: unauthorizedResponse
  }
};
