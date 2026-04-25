import { FastifyInstance } from "fastify";
import * as systemController from "./content.controller.js";

export default async function systemRoutes(app: FastifyInstance) {
    // ℹ️ Get all system content (Terms, Privacy, FAQ, About)
    app.get("/content", {
        schema: {
            summary: "Get all common system content",
            tags: ["Common"],
        }
    }, systemController.getSystemContent);

    // ℹ️ Get specific content by key
    app.get("/content/:key", {
        schema: {
            summary: "Get content by key (terms, privacy, about)",
            tags: ["Common"],
            params: {
                type: "object",
                properties: {
                    key: { type: "string" }
                }
            }
        }
    }, systemController.getContentByKey);
}
