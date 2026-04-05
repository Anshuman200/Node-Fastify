import Fastify from "fastify";
import { seedAdmin } from "./db/seed.js";


// Routes
import authRoutes from "./modules/auth/auth.routes.js";
import adminRoutes from "./modules/admin/admin.routes.js";
import healthRoutes from "./modules/health/health.routes.js";

// Core Plugins
import errorHandlerPlugin from "./plugins/error-handler.js";
import sanitizerPlugin from "./plugins/sanitizer.js";

// Security Plugins
import helmetPlugin from "./plugins/helmet.js";
import corsPlugin from "./plugins/cors.js";
import csrfPlugin from "./plugins/csrf.js";

// Infrastructure Plugins
import redisPlugin from "./plugins/redis.js";
import mongoPlugin from "./plugins/mongo.js";

// Utility Plugins
import jwtPlugin from "./plugins/jwt.js";
import rateLimitPlugin from "./plugins/rate-limit.js";

// Docs & UX
import swaggerPlugin from "./plugins/swagger.js";
import welcomePlugin from "./plugins/welcome.js";
import notFoundPlugin from "./plugins/not-found.js";

// Performance
import compressPlugin from "./plugins/compress.js";

const buildApp = async () => {
    const app = Fastify({
        logger: {
            level: "info"
        },
        bodyLimit: 1048576 * 100,
        connectionTimeout: 30000,
        requestIdHeader: "x-request-id"
    });

    /**
     * 🔹 1. Core
     */
    await app.register(errorHandlerPlugin);
    await app.register(sanitizerPlugin);

    /**
     * 🔹 2. Security Layer
     */
    await app.register(helmetPlugin);
    await app.register(corsPlugin);
    await app.register(csrfPlugin);

    /**
     * 🔹 3. Infrastructure (CRITICAL)
     * If these fail → app should not start
     */
    await app.register(mongoPlugin);
    await seedAdmin(app.log);
    await app.register(redisPlugin);

    /**
     * 🔹 4. Auth & Rate Limit
     */
    await app.register(jwtPlugin);
    await app.register(rateLimitPlugin);

    /**
     * 🔹 5. Performance
     */
    await app.register(compressPlugin);

    /**
     * 🔹 6. Docs & Default Routes
     */
    await app.register(swaggerPlugin, {
        projectName: "Learn"
    });

    await app.register(welcomePlugin, {
        projectName: "Learn"
    });

    /**
     * 🔹 7. Routes
     */
    app.register(authRoutes, { prefix: "/api/v1/user" });
    app.register(adminRoutes, { prefix: "/api/v1/admin" });
    app.register(healthRoutes, { prefix: "/api/v1" });

    /**
     * 🔹 8. Not Found (last)
     */
    await app.register(notFoundPlugin, {
        projectName: "Learn"
    });

    return app;
};

export default buildApp;