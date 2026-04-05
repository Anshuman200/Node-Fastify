export default async function healthRoutes(app) {

    // Full health
    app.get("/health", { schema: { hide: false, tags: ["DB Health"] } }, async () => {
        return {
            status: "ok",
            db: app.mongo.connection.readyState === 1 ? "Connected" : "Disconnected",
            redis: app.redis?.status === "ready" ? "Connected" : "Disconnected",
            uptime: process.uptime(),
        };
    });
}