import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { env } from "../config/env.js";
import { authenticate } from "../core/security/auth.middleware.js";
import { authorize } from "../core/security/rbac.middleware.js";
import { verifyApiKey } from "../core/security/apiKey.middleware.js";
import { verifySignature } from "../core/security/signature.middleware.js";

/**
 * 🔐 Security Plugin
 * Decorates Fastify instance with security utilities and middlewares.
 */

declare module "fastify" {
  interface FastifyInstance {
    auth: {
      authenticate: typeof authenticate;
      authorize: typeof authorize;
      verifyApiKey: typeof verifyApiKey;
      verifySignature: typeof verifySignature;
    };
  }
}

export default fp(async function securityPlugin(app: FastifyInstance) {
    app.decorate("secrets", {
        JWT_SECRET: env.JWT_SECRET,
        SIGNATURE_SECRET: env.SIGNATURE_SECRET,
        API_KEYS: {
            "web-client": env.API_KEY_SECRET // Mapping the single key to a client for now
        }
    });

    app.decorate("auth", {
        authenticate,
        authorize,
        verifyApiKey,
        verifySignature
    });

    app.log.info("✅ Security utilities and secrets decorated");
}, {
    name: "security",
});
