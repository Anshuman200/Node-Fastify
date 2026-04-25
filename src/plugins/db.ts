import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { connectDB, disconnectDB } from "../db/connection.js";
import mongoose from "mongoose";

/**
 * 🔌 Database Plugin
 * Decorates Fastify instance with Mongoose connection and handles lifecycle.
 */

declare module "fastify" {
  interface FastifyInstance {
    db: typeof mongoose;
  }
}

export default fp(async function dbPlugin(app: FastifyInstance) {
    try {
        await connectDB(app.log);

        // Decorate app instance with db (new) and mongo (legacy)
        app.decorate("db", mongoose);
        app.decorate("mongo", mongoose);

        // Graceful shutdown
        app.addHook("onClose", async (instance) => {
            await disconnectDB(instance.log);
        });

    } catch (error: any) {
        app.log.error(`❌ DB Plugin initialization failed: ${error.message}`);
        process.exit(1);
    }
}, {
    name: "db",
});
