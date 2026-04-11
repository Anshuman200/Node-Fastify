import "dotenv/config";
import { loadSecrets, validateEnv } from "./src/utils/secrets.js";
import { AWS_CONFIG } from "./src/constants/config.js";
import buildApp from "./src/bootstrap.js";

async function start() {
    try {
        // 🔐 Load secrets (DO NOT crash if AWS fails — fallback is intentional)
        const secrets = await loadSecrets(
            AWS_CONFIG.SECRET_NAME,
            AWS_CONFIG.REGION
        );

        if (!secrets.success) {
            console.warn("⚠️ Using fallback environment (.env)");
        }

        // 🔐 Validate required env
        validateEnv([
            "MONGODB_URI",
            "REDIS_HOST",
            "REDIS_PORT",
            "RESEND_API_KEY",
            "JWT_SECRET",
        ]);

        const app = await buildApp();

        const port = Number(process.env.PORT) || 3333;

        await app.listen({
            port,
            host: "0.0.0.0",
        });
        console.log("AWS Secrets Loaded ", secrets);
        console.log(`🚀 Server running on http://localhost:${port}`);
        console.log(`📜 Docs: http://localhost:${port}/swagger`);

        // 🧼 Graceful shutdown hooks
        const shutdown = async (signal: string) => {
            console.log(`\n🛑 Received ${signal}. Shutting down...`);
            try {
                await app.close();
                console.log("✅ Server closed cleanly");
                process.exit(0);
            } catch (err) {
                console.error("❌ Error during shutdown:", err);
                process.exit(1);
            }
        };

        process.on("SIGINT", shutdown);
        process.on("SIGTERM", shutdown);

    } catch (err) {
        console.error("❌ Startup failed:", err);
        process.exit(1);
    }
}

start();