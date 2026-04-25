import { FastifyInstance } from "fastify";
import { authController } from "./auth.controller.js";
import { loginSchema } from "./auth.schema.js";
import { authenticate } from "../../core/security/auth.middleware.js";
import { verifyApiKey } from "../../core/security/apiKey.middleware.js";
import { verifySignature } from "../../core/security/signature.middleware.js";
import { authorize } from "../../core/security/rbac.middleware.js";

/**
 * 🛣️ Auth Routes
 */

export default async function authRoutes(app: FastifyInstance) {
  // Public Routes
  app.post("/login", { 
    schema: {
        ...loginSchema,
        tags: ["User Auth"],
        summary: "Standard user/admin login"
    } 
  }, authController.login);

  // Example Protected Route: Multi-Layer Security
  app.get("/secure-admin-check", {
    schema: {
        tags: ["Admin Auth"],
        summary: "Multi-layer security check",
        security: [{ bearerAuth: [] }]
    },
    preHandler: [
      verifyApiKey,    
      verifySignature, 
      authenticate,    
      authorize(["admin"]) 
    ]
  }, async (request, reply) => {
    return reply.send({
      success: true,
      message: "Multi-layer security check passed!",
      user: request.user
    });
  });

  // Regular Protected Routes
  app.get("/profile", { 
    schema: {
        tags: ["User Auth"],
        summary: "Get current profile",
        security: [{ bearerAuth: [] }]
    },
    preHandler: [authenticate] 
  }, authController.getUserDetail);

  app.post("/logout", { 
    schema: {
        tags: ["User Auth"],
        summary: "Logout user",
        security: [{ bearerAuth: [] }]
    },
    preHandler: [authenticate] 
  }, authController.logout);
}
