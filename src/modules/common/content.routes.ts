import { FastifyInstance } from "fastify";
import * as systemController from "./content.controller.js";
import * as schemas from "./content.schema.js";

/**
 * 🛣️ Common Content Routes (Schema Integrated)
 */

export default async function systemRoutes(app: FastifyInstance) {
    // ℹ️ Get all system content
    app.get("/content", {
        schema: schemas.getSystemContentSchema
    }, systemController.getSystemContent);

    // ℹ️ Get specific content by key
    app.get("/content/:key", {
        schema: schemas.getContentByKeySchema
    }, systemController.getContentByKey);
}
