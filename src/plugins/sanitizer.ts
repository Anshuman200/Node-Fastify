import fp from "fastify-plugin";
import { FastifyInstance, FastifyRequest } from "fastify";

/**
 * Recursive sanitization function to trim and escape basic strings
 */
function sanitizeInput(data: any): any {
    if (typeof data === "string") {
        // Basic trim and potential HTML tag removal if needed
        return data.trim().replace(/<[^>]*>?/gm, "");
    }

    if (Array.isArray(data)) {
        return data.map(item => sanitizeInput(item));
    }

    if (data !== null && typeof data === "object") {
        const clean: Record<string, any> = {};
        for (const [key, value] of Object.entries(data)) {
            clean[key] = sanitizeInput(value);
        }
        return clean;
    }

    return data;
}

export default fp(async function sanitizerPlugin(app: FastifyInstance) {
    app.addHook("preValidation", async (request: FastifyRequest) => {
        // Allow route-level opt-out
        if ((request as any).routeOptions?.config?.sanitize === false) {
            return;
        }

        // Sanitize body
        if (request.body && typeof request.body === "object") {
            request.body = sanitizeInput(request.body);
        }

        // Sanitize query
        if (request.query && typeof request.query === "object") {
            (request as any).query = sanitizeInput(request.query);
        }

        // Sanitize params
        if (request.params && typeof request.params === "object") {
            (request as any).params = sanitizeInput(request.params);
        }
    });

}, {
    name: "app-sanitizer",
});