import fp from "fastify-plugin";
import xss from "xss";

function sanitizeInput(data) {
    if (typeof data === "string") return xss(data);

    if (Array.isArray(data)) {
        return data.map(sanitizeInput);
    }

    if (data && typeof data === "object") {
        const clean = {};
        for (const key in data) {
            clean[key] = sanitizeInput(data[key]);
        }
        return clean;
    }

    return data;
}

export default fp(async function sanitizerPlugin(app) {

    app.addHook("preValidation", async (request, reply) => {

        // Allow route-level opt-out
        if (request.routeOptions?.config?.sanitize === false) {
            return;
        }

        // Sanitize body
        if (request.body && typeof request.body === "object") {
            request.body = sanitizeInput(request.body);
        }

        // Sanitize query
        if (request.query && typeof request.query === "object") {
            request.query = sanitizeInput(request.query);
        }

        // Sanitize params
        if (request.params && typeof request.params === "object") {
            request.params = sanitizeInput(request.params);
        }
    });

}, {
    name: "app-sanitizer",
});