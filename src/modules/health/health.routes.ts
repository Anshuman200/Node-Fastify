import { FastifyInstance } from "fastify";

export default async function healthRoutes(app: FastifyInstance) {

    // Full health
    app.get("/health", { schema: { hide: false, tags: ["DB Health"] } }, async () => {
        return {
            status: "ok",
            db: (app as any).mongo?.connection?.readyState === 1 ? "Connected" : "Disconnected",
            redis: (app as any).redis?.status === "ready" ? "Connected" : "Disconnected",
            uptime: process.uptime(),
        };
    });
}