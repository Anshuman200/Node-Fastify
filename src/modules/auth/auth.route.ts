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
  app.post("/login", { schema: loginSchema }, authController.login);

  // Example Protected Route: Multi-Layer Security
  // JWT + API Key + Signature + RBAC (Admin)
  app.get("/secure-admin-check", {
    preHandler: [
      verifyApiKey,    // Layer 1: API Key
      verifySignature, // Layer 2: HMAC Signature
      authenticate,    // Layer 3: JWT Auth
      authorize(["admin"]) // Layer 4: RBAC
    ]
  }, async (request, reply) => {
    return reply.send({
      success: true,
      message: "Multi-layer security check passed!",
      user: request.user
    });
  });

  // Regular Protected Routes
  app.get("/profile", { preHandler: [authenticate] }, authController.getUserDetail);
  app.post("/logout", { preHandler: [authenticate] }, authController.logout);
}
