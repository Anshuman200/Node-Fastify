import { FastifyInstance } from "fastify";
import * as schemas from "./health.schema.js";

/**
 * 🛣️ Health Routes (Schema Integrated)
 */

export default async function healthRoutes(app: FastifyInstance) {
    // Full health
    app.get("/health", { 
        schema: schemas.healthSchema 
    }, async () => {
        return {
            status: "ok",
            db: (app as any).mongo?.connection?.readyState === 1 ? "Connected" : "Disconnected",
            redis: (app as any).redis?.status === "ready" ? "Connected" : "Disconnected",
            uptime: process.uptime(),
        };
    });
}