import fp from "fastify-plugin";
import { connectDB, disconnectDB } from "../db/connection.js";

export default fp(async function mongoPlugin(app) {
    const uri = process.env.MONGODB_URI;

    try {
        const connection = await connectDB(uri, app.log);

        // attach to fastify
        app.decorate("mongo", connection);

    } catch (error) {
        app.log.error("❌ Unable to connect DB");
        process.exit(1); // industry standard
    }

    // graceful shutdown
    app.addHook("onClose", async (app) => {
        await disconnectDB(app.log);
    });

}, {
    name: "mongo-plugin",
});