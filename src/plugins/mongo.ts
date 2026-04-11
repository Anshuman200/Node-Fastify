import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { connectDB, disconnectDB } from "../db/connection.js";

export default fp(async function mongoPlugin(app: FastifyInstance) {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        app.log.error("❌ MONGODB_URI is missing. Ensure it is set in AWS Secrets Manager or .env (if allowed).");
        process.exit(1);
    }

    try {
        const connection = await connectDB(uri, app.log);

        // attach to fastify
        app.decorate("mongo", connection);

    } catch (error: any) {
        app.log.error(`❌ Unable to connect DB: ${error.message}`);
        process.exit(1); // industry standard
    }

    // graceful shutdown
    app.addHook("onClose", async (app) => {
        await disconnectDB(app.log);
    });

}, {
    name: "mongo-plugin",
});