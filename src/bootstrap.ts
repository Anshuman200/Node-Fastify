import Fastify, { FastifyInstance } from "fastify";
import path from "path";
import fastifyStatic from "@fastify/static";
import { env, initializeConfig } from "./config/env.js";

// Infrastructure
import dbPlugin from "./plugins/db.js";
import redisPlugin from "./plugins/redis.js";
import seederPlugin from "./plugins/seeder.js";
import securityPlugin from "./plugins/security.js";

// Core
import sanitizerPlugin from "./plugins/sanitizer.js";
import sessionPlugin from "./plugins/session.js";
import helmetPlugin from "./plugins/helmet.js";
import corsPlugin from "./plugins/cors.js";
import csrfPlugin from "./plugins/csrf.js";
import jwtPlugin from "./plugins/jwt.js";
import rateLimitPlugin from "./plugins/rate-limit.js";
import compressPlugin from "./plugins/compress.js";

// Docs & UI
import basicAuthPlugin from "./plugins/basic-auth.js";
import swaggerPlugin from "./plugins/swagger.js";
import welcomePlugin from "./plugins/welcome.js";

// Routes
import authRoutes from "./modules/auth/auth.route.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import healthRoutes from "./modules/health/health.routes.js";
import systemRoutes from "./modules/common/content.routes.js";

// Fallback
import notFoundPlugin from "./plugins/not-found.js";

/**
 * 🚀 Build Application (Production Ready)
 */

const buildApp = async (): Promise<FastifyInstance> => {
    await initializeConfig();

    const app = Fastify({
        logger: {
            level: env.NODE_ENV === "development" ? "debug" : "info"
        },
        ajv: {
            customOptions: {
                keywords: ["example"] // ✅ Allow OpenAPI 'example' keyword in schemas
            }
        },
        pluginTimeout: 30000, // ✅ Increase timeout for heavy plugins (like seeder)
        trustProxy: true,
        bodyLimit: 10 * 1024 * 1024, // ✅ 10MB safer default
    });

    /**
     * 🔹 1. Core Security (FIRST)
     */
    await app.register(helmetPlugin);
    await app.register(corsPlugin);
    await app.register(compressPlugin);

    /**
     * 🔹 2. Core Middleware
     */
    await app.register(sanitizerPlugin);
    await app.register(sessionPlugin);

    /**
     * 🔹 3. Auth & Security Layer
     */
    await app.register(jwtPlugin);
    await app.register(csrfPlugin);
    await app.register(rateLimitPlugin);

    /**
     * 🔹 4. Infrastructure (DB + Cache)
     */
    await app.register(redisPlugin);
    await app.register(dbPlugin);
    await app.register(seederPlugin);

    /**
     * 🔹 5. Custom Security Decorators
     */
    await app.register(securityPlugin);

    /**
     * 🔹 6. Docs & UI (Register BEFORE routes to pick up schemas)
     */
    await app.register(basicAuthPlugin);
    await app.register(swaggerPlugin);
    await app.register(welcomePlugin);

    /**
     * 🔹 7. Static Assets
     */
    await app.register(fastifyStatic, {
        root: path.join(process.cwd(), "public"),
        prefix: "/public/",
    });

    /**
     * 🔹 8. Health Routes
     */
    await app.register(healthRoutes, { prefix: "/api/v1" });

    /**
     * 🔹 9. API Routes
     */
    await app.register(authRoutes, { prefix: "/api/v1/auth" });
    await app.register(adminRoutes, { prefix: "/api/v1/admin" });
    await app.register(systemRoutes, { prefix: "/api/v1/common" });

    /**
     * 🔹 🔟 Not Found Handler
     */
    await app.register(notFoundPlugin);

    /**
     * 🔹 11. Global Error Handler (ONLY ONE)
     */
    app.setErrorHandler((error: any, request, reply) => {
        app.log.error(error);

        const statusCode = error.statusCode || 500;

        reply.status(statusCode).send({
            success: false,
            message:
                statusCode >= 500
                    ? "Internal Server Error"
                    : error.message,
            ...(env.NODE_ENV === "development" && {
                stack: error.stack,
            }),
        });
    });

    return app;
};

export default buildApp;