import fp from "fastify-plugin";
import { FastifyInstance } from "fastify";
import { seeder } from "../utils/db/seeder.util.js";

/**
 * 🌱 Seeder Plugin
 * Runs the database seeder on application startup.
 */

export default fp(async function seederPlugin(app: FastifyInstance) {
    // We run the seeder once the DB connection is established
    // Since dbPlugin is a dependency, it will run after DB is ready
    app.log.info("📡 Starting database seeding...");
    await seeder.run();
    app.log.info("✅ Database seeding completed");
}, {
    name: "seeder",
    dependencies: ["db"]
});
