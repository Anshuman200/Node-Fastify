import buildApp from "./src/bootstrap.js";
import { env } from "./src/config/env.js";

/**
 * 🏁 Server Entry Point (Production Ready)
 */

async function start() {
    const app = await buildApp();

    // 🛑 Prevent multiple shutdown calls
    let isShuttingDown = false;

    const shutdown = async (signal: string) => {
        if (isShuttingDown) return;
        isShuttingDown = true;

        app.log.info(`📴 Received ${signal}. Shutting down...`);

        try {
            await app.close();
            app.log.info("✅ Server closed cleanly");
            process.exit(0);
        } catch (err: any) {
            app.log.error("❌ Error during shutdown", err);
            process.exit(1);
        }
    };

    try {
        const address = await app.listen({
            port: env.PORT,
            host: "0.0.0.0",
        });

        // ✅ Use Fastify logger (NOT console.log)
        app.log.info(`🚀 Server running at ${address}`);
        app.log.info(`🌍 Environment: ${env.NODE_ENV}`);
        app.log.info(`📜 API Base: ${address}/api/v1`);

        // 🛑 Graceful shutdown
        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    } catch (err: any) {
        app.log.error("❌ Startup failed", err);
        process.exit(1);
    }
}

/**
 * ⚠️ Global Error Handlers (CRITICAL)
 */

// Unhandled Promise Rejections
process.on("unhandledRejection", (reason: any) => {
    console.error("❌ Unhandled Rejection:", reason);
    process.exit(1);
});

// Uncaught Exceptions
process.on("uncaughtException", (err: any) => {
    console.error("❌ Uncaught Exception:", err);
    process.exit(1);
});

start();