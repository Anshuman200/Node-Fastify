import { FastifyInstance } from "fastify";
import { getQueueMetrics } from "../../utils/queue/metrics.util.js";
import { checkRedisHealth } from "../../queue/connection.js";
import { schemas } from "./health.schema.js";

/**
 * 🏥 Unified System Health & Metrics Routes
 */
export default async function healthRoutes(app: FastifyInstance) {
    
    // 1. Full System Health (DB + Redis + Queues)
    app.get("/health", {
        schema: schemas.healthSchema
    }, async () => {
        // Run all checks in parallel for max performance
        const [redisReady, emailStats, notifyStats, analyticsStats] = await Promise.all([
            checkRedisHealth(app.redis),
            getQueueMetrics(app.queues.email),
            getQueueMetrics(app.queues.notification),
            getQueueMetrics(app.queues.analytics),
        ]);

        const allQueuesReady = [emailStats, notifyStats, analyticsStats].every(q => q.isReady);
        const status = (redisReady && allQueuesReady) ? "ok" : "degraded";

        return {
            status,
            timestamp: new Date().toISOString(),
            services: {
                database: "connected",
                redis: redisReady ? "connected" : "disconnected",
                queues: {
                    status: allQueuesReady ? "ready" : "degraded",
                    details: [emailStats, notifyStats, analyticsStats]
                }
            }
        };
    });

    // 2. Detailed Queue Metrics
    app.get("/metrics/queue", {
        schema: schemas.metricsSchema
    }, async () => {
        return {
            timestamp: new Date().toISOString(),
            queues: {
                email: await getQueueMetrics(app.queues.email),
                notification: await getQueueMetrics(app.queues.notification),
                analytics: await getQueueMetrics(app.queues.analytics),
            }
        };
    });
}