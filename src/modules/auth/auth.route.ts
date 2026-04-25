import { FastifyInstance } from "fastify";
import { authController } from "./auth.controller.js";
import * as schemas from "./auth.schema.js";
import { authenticate } from "../../core/security/auth.middleware.js";
import { verifyApiKey } from "../../core/security/apiKey.middleware.js";
import { verifySignature } from "../../core/security/signature.middleware.js";
import { authorize } from "../../core/security/rbac.middleware.js";

/**
 * 🛣️ Auth Routes (Schema Integrated)
 */

export default async function authRoutes(app: FastifyInstance) {
  // 🔓 Public Routes
  app.post("/login", { 
    schema: schemas.loginSchema 
  }, authController.login);

  // 🛡️ Protected Routes (Multi-Layer Security)
  app.get("/secure-admin-check", {
    schema: schemas.secureCheckSchema,
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

  // 👤 Regular Protected Routes
  app.get("/profile", { 
    schema: schemas.profileSchema,
    preHandler: [authenticate] 
  }, authController.getUserDetail);

  app.post("/logout", { 
    schema: schemas.logoutSchema,
    preHandler: [authenticate] 
  }, authController.logout);
}
